import express from 'express';
import { register, login, getMe, verifyEmail, resendVerification, checkEmail, checkPhone } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/check-email', checkEmail);
router.post('/check-phone', checkPhone);

export default router;
