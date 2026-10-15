import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { avatarLimiter } from '../middleware/rateLimiter.js';
import { updateProfile, changePassword, uploadAvatar, avatarUpload } from '../controllers/userController.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/avatar', protect, avatarLimiter, avatarUpload.single('avatar'), uploadAvatar);

export default router;
