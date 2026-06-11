import express from 'express';
import { updateAvatar, deleteAvatar } from '../controllers/profileController.js';
import { uploadAvatarMiddleware, handleUploadError } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Routes under /api/profile
router.patch('/avatar', uploadAvatarMiddleware, handleUploadError, updateAvatar);
router.delete('/avatar', deleteAvatar);

export default router;
