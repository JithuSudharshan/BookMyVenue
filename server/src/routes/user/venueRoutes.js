import express from 'express';
import { protect, authorize } from '../../middlewares/authMiddleware.js';
import { getVenueById } from '../../controllers/venueController.js';

const router = express.Router();

// Public route — anyone with a valid session can see venue detail
router.get('/public/:id', getVenueById);



export default router;
