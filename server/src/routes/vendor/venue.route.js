import express from 'express';
import * as venueController from '../../controllers/vendor/venue.controller.js';

const router = express.Router();

// Note: These routes are expected to be mounted on '/vendor/venues'
// Example in server.js or routes/index.js: app.use('/vendor/venues', vendorVenueRoutes);

// Draft Routes
router.post('/draft', venueController.saveDraft); // For initial creation
router.patch('/:id/draft', venueController.saveDraft); // For updating draft

// Submission & CRUD Routes
router.post('/', venueController.createVenue);
router.get('/', venueController.getVendorVenues); // Also handles ?status=draft
router.get('/:id', venueController.getVenueById); // Also acts as continueDraft
router.patch('/:id', venueController.updateVenue);
router.patch('/:id/block', venueController.blockVenue);
router.patch('/:id/unblock', venueController.unblockVenue);

export default router;
