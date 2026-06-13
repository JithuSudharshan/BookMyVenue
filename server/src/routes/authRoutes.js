import express from 'express';
import { register, registerVendor, login, logout, getMe, verifyEmail, resendVerification, checkEmail, checkPhone, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/register-vendor', registerVendor);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/check-email', checkEmail);
router.post('/check-phone', checkPhone);

export default router;
