import Blog from '../models/Blog.js';
import { sanitizeHTML } from '../utils/sanitize.js';
import { processImage, generateSafeFilename, deleteFile } from '../utils/imageProcessor.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlogService {
  async getAll(limit = null) {
    return await Blog.getAll(limit);
  }

  async getById(id) {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new Error('Blog not found');
    }
    return blog;
  }

  async create(blogData, thumbnailFile) {
    // Sanitize HTML content
    if (blogData.content) {
      blogData.content = sanitizeHTML(blogData.content);
    }

    let thumbnailPath = null;

    if (thumbnailFile) {
      const filename = generateSafeFilename(thumbnailFile.originalname);
      const outputPath = path.join(__dirname, '../../uploads/blogs', filename);
      
      await processImage(thumbnailFile.buffer, outputPath, {
        width: 1200,
        height: 630,
        quality: 85
      });

      thumbnailPath = `/uploads/blogs/${filename}`;
    }

    const blog = await Blog.create({
      ...blogData,
      thumbnail: thumbnailPath
    });

    return blog;
  }

  async update(id, updateData, thumbnailFile) {
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      throw new Error('Blog not found');
    }

    // Sanitize HTML content if provided
    if (updateData.content) {
      updateData.content = sanitizeHTML(updateData.content);
    }

    let thumbnailPath = existingBlog.thumbnail;

    if (thumbnailFile) {
      // Delete old thumbnail
      if (existingBlog.thumbnail) {
        const oldPath = path.join(__dirname, '../..', existingBlog.thumbnail);
        await deleteFile(oldPath);
      }

      // Process new thumbnail
      const filename = generateSafeFilename(thumbnailFile.originalname);
      const outputPath = path.join(__dirname, '../../uploads/blogs', filename);
      
      await processImage(thumbnailFile.buffer, outputPath, {
        width: 1200,
        height: 630,
        quality: 85
      });

      thumbnailPath = `/uploads/blogs/${filename}`;
      updateData.thumbnail = thumbnailPath;
    }

    return await Blog.update(id, updateData);
  }

  async delete(id) {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new Error('Blog not found');
    }

    // Delete thumbnail file
    if (blog.thumbnail) {
      const thumbnailPath = path.join(__dirname, '../..', blog.thumbnail);
      await deleteFile(thumbnailPath);
    }

    await Blog.delete(id);
    return { message: 'Blog deleted successfully' };
  }
}

export default new BlogService();

