import Talent from '../models/Talent.js';
import { processImage, generateSafeFilename, deleteFile } from '../utils/imageProcessor.js';
import { sanitizeHTML } from '../utils/sanitize.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { MAX_TALENT_IMAGES } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TalentService {
  async getAll() {
    const talents = await Talent.getAll();
    
    // Get first image for each talent (for list view)
    for (const talent of talents) {
      const images = await Talent.getImages(talent.id);
      talent.image = images.length > 0 ? images[0].image_url : null;
      talent.category = talent.level; // Frontend uses 'category'
    }
    
    return talents;
  }

  async getById(id) {
    const talent = await Talent.findById(id);
    if (!talent) {
      throw new Error('Talent not found');
    }

    // Get all images with full details (including IDs for removal tracking)
    const images = await Talent.getImages(id);
    talent.images = images.map(img => ({
      id: img.id,
      imageId: img.id, // Alias for compatibility
      image_url: img.image_url,
      url: img.image_url, // Alias for compatibility
      display_order: img.display_order
    }));
    talent.category = talent.level; // Frontend uses 'category'

    return talent;
  }

  async create(talentData, imageFiles) {
    // Sanitize HTML description
    if (talentData.description) {
      talentData.description = sanitizeHTML(talentData.description);
    }

    const talent = await Talent.create(talentData);

    // Process and save images
    if (imageFiles && imageFiles.length > 0) {
      const maxImages = Math.min(imageFiles.length, MAX_TALENT_IMAGES);
      
      for (let i = 0; i < maxImages; i++) {
        const file = imageFiles[i];
        const filename = generateSafeFilename(file.originalname);
        const outputPath = path.join(__dirname, '../../uploads/talents', filename);
        
        await processImage(file.buffer, outputPath, {
          width: 1920,
          height: 1920,
          quality: 90
        });

        const imageUrl = `/uploads/talents/${filename}`;
        await Talent.addImage(talent.id, imageUrl, i + 1);
      }
    }

    return this.getById(talent.id);
  }

  async update(id, updateData, imageFiles) {
    console.log('TalentService.update called:', {
      talentId: id,
      updateDataKeys: Object.keys(updateData),
      hasRemovedImageIds: !!updateData.removedImageIds,
      removedImageIdsType: typeof updateData.removedImageIds,
      removedImageIdsValue: updateData.removedImageIds,
      imageFilesCount: imageFiles?.length || 0
    });

    const existingTalent = await Talent.findById(id);
    if (!existingTalent) {
      throw new Error('Talent not found');
    }

    // Sanitize HTML description if provided
    if (updateData.description) {
      updateData.description = sanitizeHTML(updateData.description);
    }

    // Handle removed images (sent from CMS when images are removed)
    let removedImageIds = [];
    if (updateData.removedImageIds) {
      console.log('Processing removedImageIds:', updateData.removedImageIds);
      // Parse if it's a string (from form data)
      if (typeof updateData.removedImageIds === 'string') {
        try {
          removedImageIds = JSON.parse(updateData.removedImageIds);
        } catch (e) {
          // If parsing fails, treat as comma-separated string
          removedImageIds = updateData.removedImageIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
        }
      } else if (Array.isArray(updateData.removedImageIds)) {
        removedImageIds = updateData.removedImageIds;
      }
      
      // Ensure all IDs are numbers
      removedImageIds = removedImageIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id));
      
      console.log('Removing talent images:', { talentId: id, removedImageIds });
      
      // Delete removed images
      for (const imageId of removedImageIds) {
        try {
          await this.deleteImage(id, imageId);
          console.log(`Successfully deleted image ${imageId} for talent ${id}`);
        } catch (error) {
          console.error(`Failed to delete image ${imageId} for talent ${id}:`, error.message);
          // Continue with other images even if one fails
        }
      }
      
      // Remove from updateData so it doesn't try to update the database column
      delete updateData.removedImageIds;
    }

    await Talent.update(id, updateData);

    // Handle new images
    if (imageFiles && imageFiles.length > 0) {
      const existingImages = await Talent.getImages(id);
      const currentCount = existingImages.length;
      const maxNewImages = MAX_TALENT_IMAGES - currentCount;

      if (maxNewImages > 0) {
        const imagesToAdd = Math.min(imageFiles.length, maxNewImages);
        
        for (let i = 0; i < imagesToAdd; i++) {
          const file = imageFiles[i];
          const filename = generateSafeFilename(file.originalname);
          const outputPath = path.join(__dirname, '../../uploads/talents', filename);
          
          await processImage(file.buffer, outputPath, {
            width: 1920,
            height: 1920,
            quality: 90
          });

          const imageUrl = `/uploads/talents/${filename}`;
          await Talent.addImage(id, imageUrl, currentCount + i + 1);
        }
      }
    }

    return this.getById(id);
  }

  async delete(id) {
    const talent = await Talent.findById(id);
    if (!talent) {
      throw new Error('Talent not found');
    }

    // Delete all images
    const images = await Talent.getImages(id);
    for (const image of images) {
      const imagePath = path.join(__dirname, '../..', image.image_url);
      await deleteFile(imagePath);
    }

    await Talent.delete(id);
    return { message: 'Talent deleted successfully' };
  }

  async deleteImage(talentId, imageId) {
    // Convert imageId to number for comparison
    const imageIdNum = typeof imageId === 'string' ? parseInt(imageId, 10) : imageId;
    
    const images = await Talent.getImages(talentId);
    const image = images.find(img => img.id === imageIdNum || String(img.id) === String(imageId));
    
    if (!image) {
      throw new Error(`Image not found with ID: ${imageId} (converted: ${imageIdNum})`);
    }

    // Delete file
    const imagePath = path.join(__dirname, '../..', image.image_url);
    await deleteFile(imagePath);

    // Delete from database (use the actual database ID)
    await Talent.deleteImage(image.id);
    return { message: 'Image deleted successfully' };
  }
}

export default new TalentService();

