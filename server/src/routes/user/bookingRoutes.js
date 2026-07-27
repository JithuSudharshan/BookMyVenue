import express from 'express';
import * as bookingController from '../../controllers/bookingController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/pricing-summary', bookingController.getPricingSummary);

// Protected routes
router.use(protect); // All following booking routes require authentication

// Session routes
router.post('/session', bookingController.createSession);
router.get('/session/:sessionId', bookingController.getSession);
router.delete('/session/:sessionId', bookingController.releaseSession);

export default router;
