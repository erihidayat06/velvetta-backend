import express from 'express';
import talentController from '../controllers/talentController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/security.js';
import { MAX_TALENT_IMAGES } from '../config/constants.js';

const router = express.Router();

// Public routes (read only)
router.get('/', talentController.getAll);
router.get('/:id', talentController.getById);

// Admin only routes (CRUD)
router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadLimiter,
  uploadMultiple('images', MAX_TALENT_IMAGES),
  handleUploadError,
  validate(schemas.createTalent),
  talentController.create
);

router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  uploadLimiter,
  uploadMultiple('images', MAX_TALENT_IMAGES),
  handleUploadError,
  validate(schemas.updateTalent),
  talentController.update
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  talentController.delete
);

router.delete(
  '/:talentId/images/:imageId',
  authenticate,
  requireAdmin,
  talentController.deleteImage
);

export default router;

