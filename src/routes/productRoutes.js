import express from 'express';
import productController from '../controllers/productController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/security.js';

const router = express.Router();

// Public routes (read only)
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Admin only routes (CRUD)
router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadLimiter,
  uploadSingle('image'),
  handleUploadError,
  validate(schemas.createProduct),
  productController.create
);

router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  uploadLimiter,
  uploadSingle('image'),
  handleUploadError,
  validate(schemas.updateProduct),
  productController.update
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  productController.delete
);

export default router;

