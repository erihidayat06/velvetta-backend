import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(schemas.register), userController.register);
router.post('/login', authLimiter, validate(schemas.login), userController.login);

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.patch('/password', authenticate, validate(schemas.updatePassword), userController.updatePassword);

// Admin only routes
router.get('/all', authenticate, requireAdmin, userController.getAll);
router.patch('/:userId/vvip', authenticate, requireAdmin, validate(schemas.updateUserVvip), userController.updateUserVvip);

export default router;

