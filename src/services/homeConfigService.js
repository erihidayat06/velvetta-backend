import HomeConfig from '../models/HomeConfig.js';
import Talent from '../models/Talent.js';
import { processImage, generateSafeFilename, deleteFile } from '../utils/imageProcessor.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { FEATURED_TALENTS_COUNT } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HomeConfigService {
  async get() {
    const config = await HomeConfig.getFormatted();
    
    // Fetch featured talent details
    if (config.featuredTalents && config.featuredTalents.length > 0) {
      const talents = [];
      for (const talentId of config.featuredTalents) {
        const talent = await Talent.findById(talentId);
        if (talent) {
          // Get first image for list view
          const images = await Talent.getImages(talentId);
          talent.image = images.length > 0 ? images[0].image_url : null;
          talent.category = talent.level;
          talents.push(talent);
        }
      }
      config.featuredTalents = talents;
    }

    // Format carousel slides
    const carouselSlides = [];
    const desktopImages = config.carouselDesktopImages || [];
    const mobileImages = config.carouselMobileImages || [];
    const maxSlides = Math.max(desktopImages.length, mobileImages.length);

    for (let i = 0; i < maxSlides; i++) {
      carouselSlides.push({
        src: desktopImages[i] || mobileImages[i] || null,
        mobileSrc: mobileImages[i] || desktopImages[i] || null,
        title: '', // Can be added to config later
        subtitle: '' // Can be added to config later
      });
    }

    config.carouselSlides = carouselSlides;
    return config;
  }

  async update(configData, desktopImageFiles = [], mobileImageFiles = []) {
    const { featuredTalentIds, remainingDesktopImages, remainingMobileImages } = configData;

    // Validate featured talents count
    if (featuredTalentIds && featuredTalentIds.length !== FEATURED_TALENTS_COUNT) {
      throw new Error(`Exactly ${FEATURED_TALENTS_COUNT} featured talents required`);
    }

    // Validate talent IDs exist
    if (featuredTalentIds) {
      for (const talentId of featuredTalentIds) {
        const talent = await Talent.findById(talentId);
        if (!talent) {
          throw new Error(`Talent with ID ${talentId} not found`);
        }
      }
    }

    // Process desktop carousel images
    const desktopImageUrls = [];
    if (desktopImageFiles && desktopImageFiles.length > 0) {
      for (const file of desktopImageFiles) {
        const filename = generateSafeFilename(file.originalname);
        const outputPath = path.join(__dirname, '../../uploads/carousel', `desktop_${filename}`);
        
        await processImage(file.buffer, outputPath, {
          width: 1920,
          height: 1080,
          quality: 90
        });

        desktopImageUrls.push(`/uploads/carousel/desktop_${filename}`);
      }
    }

    // Process mobile carousel images
    const mobileImageUrls = [];
    if (mobileImageFiles && mobileImageFiles.length > 0) {
      for (const file of mobileImageFiles) {
        const filename = generateSafeFilename(file.originalname);
        const outputPath = path.join(__dirname, '../../uploads/carousel', `mobile_${filename}`);
        
        await processImage(file.buffer, outputPath, {
          width: 768,
          height: 1024,
          quality: 90
        });

        mobileImageUrls.push(`/uploads/carousel/mobile_${filename}`);
      }
    }

    // Get existing config
    const existingConfig = await HomeConfig.get();
    
    // Helper to safely parse JSON
    const safeParseJSON = (value, defaultValue = []) => {
      if (!value) return defaultValue;
      if (typeof value === 'object') return value;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.error('Error parsing JSON in update:', error.message, 'Value:', value);
          return defaultValue;
        }
      }
      return defaultValue;
    };
    
    const existingDesktopImages = safeParseJSON(existingConfig?.carousel_desktop_images, []);
    const existingMobileImages = safeParseJSON(existingConfig?.carousel_mobile_images, []);
    
    // Determine final images:
    // - If new images uploaded, use new ones
    // - If remaining images specified, use those (for when images are removed)
    // - Otherwise, keep existing
    let finalDesktopImages = desktopImageUrls.length > 0 
      ? desktopImageUrls 
      : (remainingDesktopImages && Array.isArray(remainingDesktopImages) && remainingDesktopImages.length > 0
          ? remainingDesktopImages
          : existingDesktopImages);
    
    let finalMobileImages = mobileImageUrls.length > 0 
      ? mobileImageUrls 
      : (remainingMobileImages && Array.isArray(remainingMobileImages) && remainingMobileImages.length > 0
          ? remainingMobileImages
          : existingMobileImages);

    // Delete desktop images that are no longer needed
    const desktopImagesToKeep = [...finalDesktopImages];
    for (const oldImagePath of existingDesktopImages) {
      if (!desktopImagesToKeep.includes(oldImagePath)) {
        const oldPath = path.join(__dirname, '../..', oldImagePath);
        await deleteFile(oldPath);
        console.log(`Deleted removed desktop carousel image: ${oldImagePath}`);
      }
    }

    // Delete mobile images that are no longer needed
    const mobileImagesToKeep = [...finalMobileImages];
    for (const oldImagePath of existingMobileImages) {
      if (!mobileImagesToKeep.includes(oldImagePath)) {
        const oldPath = path.join(__dirname, '../..', oldImagePath);
        await deleteFile(oldPath);
        console.log(`Deleted removed mobile carousel image: ${oldImagePath}`);
      }
    }

    const config = await HomeConfig.createOrUpdate({
      featured_talent_ids: featuredTalentIds,
      carousel_desktop_images: finalDesktopImages,
      carousel_mobile_images: finalMobileImages
    });

    return this.get();
  }
}

export default new HomeConfigService();

