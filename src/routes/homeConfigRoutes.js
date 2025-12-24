import express from 'express';
import homeConfigController from '../controllers/homeConfigController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import multer from 'multer';
import { uploadLimiter } from '../middleware/security.js';
import { handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Configure multer for multiple fields
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5242880 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Public route (read only)
router.get('/', homeConfigController.get);

// Admin only route (update)
router.patch(
  '/',
  authenticate,
  requireAdmin,
  uploadLimiter,
  upload.fields([
    { name: 'desktopImages', maxCount: 10 },
    { name: 'mobileImages', maxCount: 10 }
  ]),
  handleUploadError,
  (req, res, next) => {
    // Validate featuredTalentIds if provided
    if (req.body.featuredTalentIds) {
      const schema = schemas.updateHomeConfig;
      const { error, value } = schema.validate({ featuredTalentIds: req.body.featuredTalentIds });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }
      req.body.featuredTalentIds = value.featuredTalentIds;
    }
    next();
  },
  homeConfigController.update
);

export default router;

