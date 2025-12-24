import blogService from '../services/blogService.js';

class BlogController {
  async getAll(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : null;
      const blogs = await blogService.getAll(limit);
      res.json({
        success: true,
        data: blogs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const blog = await blogService.getById(req.params.id);
      res.json({
        success: true,
        data: blog
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async create(req, res) {
    try {
      const blog = await blogService.create(req.body, req.file);
      res.status(201).json({
        success: true,
        message: 'Blog created successfully',
        data: blog
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const blog = await blogService.update(req.params.id, req.body, req.file);
      res.json({
        success: true,
        message: 'Blog updated successfully',
        data: blog
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      await blogService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Blog deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new BlogController();

