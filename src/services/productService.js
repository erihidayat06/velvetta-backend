import Product from '../models/Product.js';
import { processImage, deleteFile } from '../utils/imageProcessor.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductService {
  async getAll() {
    return await Product.getAll();
  }

  async getById(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async create(productData, imageFile) {
    let imagePath = null;

    if (imageFile) {
      try {
        // Generate filename with .webp extension since we convert to WebP
        const originalName = imageFile.originalname;
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const name = path.basename(originalName, path.extname(originalName))
          .replace(/[^a-zA-Z0-9]/g, '_')
          .substring(0, 50);
        const filename = `${name}_${timestamp}_${random}.webp`;
        
        const outputPath = path.join(__dirname, '../../uploads/products', filename);
        
        console.log('Processing image:', {
          originalName,
          filename,
          outputPath,
          bufferSize: imageFile.buffer?.length
        });
        
        await processImage(imageFile.buffer, outputPath, {
          width: 800,
          height: 800,
          quality: 85,
          format: 'webp'
        });

        imagePath = `/uploads/products/${filename}`;
        console.log('Image processed successfully:', imagePath);
      } catch (error) {
        console.error('Error processing image:', error);
        throw new Error(`Failed to process image: ${error.message}`);
      }
    }

    const product = await Product.create({
      ...productData,
      image: imagePath
    });

    return product;
  }

  async update(id, updateData, imageFile) {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    let imagePath = existingProduct.image;

    if (imageFile) {
      // Delete old image
      if (existingProduct.image) {
        const oldPath = path.join(__dirname, '../..', existingProduct.image);
        await deleteFile(oldPath);
      }

      // Process new image - generate filename with .webp extension
      const originalName = imageFile.originalname;
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const name = path.basename(originalName, path.extname(originalName))
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 50);
      const filename = `${name}_${timestamp}_${random}.webp`;
      
      const outputPath = path.join(__dirname, '../../uploads/products', filename);
      
      await processImage(imageFile.buffer, outputPath, {
        width: 800,
        height: 800,
        quality: 85,
        format: 'webp'
      });

      imagePath = `/uploads/products/${filename}`;
      updateData.image = imagePath;
    }

    return await Product.update(id, updateData);
  }

  async delete(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Delete image file
    if (product.image) {
      const imagePath = path.join(__dirname, '../..', product.image);
      await deleteFile(imagePath);
    }

    await Product.delete(id);
    return { message: 'Product deleted successfully' };
  }
}

export default new ProductService();

