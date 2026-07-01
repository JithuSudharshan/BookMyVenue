import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getMyVenues, getVenueById } from '../controllers/venueController.js';

const router = express.Router();

// Public route — anyone with a valid session can see venue detail
router.get('/public/:id', getVenueById);

// Protected vendor routes
router.use(protect);
router.use(authorize('vendor'));

router.get('/my-venues', getMyVenues);

export default router;
