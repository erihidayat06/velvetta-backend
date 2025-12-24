import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Process and compress image using Sharp
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} outputPath - Output file path
 * @param {Object} options - Processing options
 * @returns {Promise<string>} - Processed file path
 */
export const processImage = async (imageBuffer, outputPath, options = {}) => {
  const {
    width = 1920,
    height = 1920,
    quality = 85,
    format = 'webp'
  } = options;

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });

  // Process image
  await sharp(imageBuffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toFormat(format, { quality })
    .toFile(outputPath);

  return outputPath;
};

/**
 * Generate safe filename
 * @param {string} originalName - Original filename
 * @returns {string} - Safe filename
 */
export const generateSafeFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName).toLowerCase();
  const name = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);
  
  return `${name}_${timestamp}_${random}${ext}`;
};

/**
 * Delete file
 * @param {string} filePath - File path to delete
 */
export const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

