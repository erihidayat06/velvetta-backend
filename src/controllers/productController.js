import productService from '../services/productService.js';

class ProductController {
  async getAll(req, res) {
    try {
      const products = await productService.getAll();
      res.json({
        success: true,
        data: products
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
      const product = await productService.getById(req.params.id);
      res.json({
        success: true,
        data: product
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
      // Debug logging
      console.log('Product create request:', {
        body: req.body,
        file: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : 'No file'
      });

      const product = await productService.create(req.body, req.file);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Product create error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const product = await productService.update(req.params.id, req.body, req.file);
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
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
      await productService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new ProductController();

