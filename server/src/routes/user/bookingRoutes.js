import express from 'express';
import * as bookingController from '../../controllers/bookingController.js';
import { protect } from '../../middlewares/authMiddleware.js';
import { pricingRateLimiter } from '../../middlewares/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/pricing-summary', pricingRateLimiter, bookingController.getPricingSummary);

// Protected routes
router.use(protect); // All following booking routes require authentication

// Session routes
router.post('/session', bookingController.createSession);
router.get('/session/:sessionId', bookingController.getSession);
router.delete('/session/:sessionId', bookingController.releaseSession);

// Payment routes
router.post('/payment/order', bookingController.createPaymentOrder);
router.post('/payment/verify', bookingController.verifyPayment);

export default router;
