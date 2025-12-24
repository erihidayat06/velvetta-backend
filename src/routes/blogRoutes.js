import express from 'express';
import blogController from '../controllers/blogController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/security.js';

const router = express.Router();

// Public routes (read only)
router.get('/', blogController.getAll);
router.get('/:id', blogController.getById);

// Admin only routes (CRUD)
router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadLimiter,
  uploadSingle('thumbnail'),
  handleUploadError,
  validate(schemas.createBlog),
  blogController.create
);

router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  uploadLimiter,
  uploadSingle('thumbnail'),
  handleUploadError,
  validate(schemas.updateBlog),
  blogController.update
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  blogController.delete
);

export default router;

