import express from 'express';
import passport from 'passport';
import { register, registerVendor, login, logout, getMe, verifyEmail, resendVerification, checkEmail, checkPhone, forgotPassword, resetPassword, googleAuthCallback, completeGoogleSignup } from '../controllers/authController.js';
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

// Google OAuth Routes
router.get('/google', (req, res, next) => {
  const role = req.query.role || '';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role,
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent('Google authentication failed.')}`);
    }
    if (!user) {
      // User was rejected (e.g. existing local account)
      const message = info?.message || 'Authentication failed.';
      return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(message)}`);
    }
    
    // We pass the user object (which might be an existing user or a temporary profile object) to our controller
    req.user = user;
    next();
  })(req, res, next);
}, googleAuthCallback);

router.post('/google/complete-signup', completeGoogleSignup);

export default router;
