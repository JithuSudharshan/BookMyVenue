import express from 'express';
import * as venueController from '../../controllers/vendor/venueController.js';
import { validateVenueSubmit, validateVenueUpdate } from '../../validators/venueValidator.js';
import { uploadVenueImage } from '../../middlewares/uploadMiddleware.js';
import { getVendorReviews } from '../../controllers/reviewController.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';

const parseVenueData = (req, res, next) => {
    try {
        if (req.body.location && typeof req.body.location === 'string') req.body.location = JSON.parse(req.body.location);
        if (req.body.amenities && typeof req.body.amenities === 'string') req.body.amenities = JSON.parse(req.body.amenities);
        if (req.body.bookingConfig && typeof req.body.bookingConfig === 'string') req.body.bookingConfig = JSON.parse(req.body.bookingConfig);
        
        let existingImages = [];
        if (req.body.images && typeof req.body.images === 'string') {
            existingImages = JSON.parse(req.body.images);
        } else if (Array.isArray(req.body.images)) {
            // some clients send multiple fields with same name as array
            existingImages = req.body.images.map(img => typeof img === 'string' ? JSON.parse(img) : img);
        }

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({ url: file.path, isPrimary: false }));
            existingImages = [...existingImages, ...newImages];
        }

        if (existingImages.length > 0) {
            if (!existingImages.some(img => img.isPrimary)) {
                existingImages[0].isPrimary = true;
            }
            req.body.images = existingImages;
        } else if (req.body.images !== undefined) {
            req.body.images = existingImages;
        }
        
        // Map for validator
        if (req.body.location) {
            req.body.address = req.body.location.address;
            req.body.city = req.body.location.city;
            req.body.state = req.body.location.state;
            req.body.pincode = req.body.location.pincode;
            req.body.googleMapLink = req.body.location.googleMapLink;
        }
        
        // Map category/subcategory for validator
        if (req.body.categoryId !== undefined) req.body.category = req.body.categoryId;
        if (req.body.subcategoryId !== undefined) req.body.subcategory = req.body.subcategoryId;

        next();
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid form data format' });
    }
};

const router = express.Router();

// Note: These routes are expected to be mounted on '/vendor/venues'
// Example in server.js or routes/index.js: app.use('/vendor/venues', vendorVenueRoutes);

// Categories Route
router.get('/categories', venueController.getActiveCategories);

// Reviews Route (vendor reads reviews for their venues)
router.get('/reviews', protect, authorize('vendor'), getVendorReviews);

// Draft Routes
router.post('/draft', uploadVenueImage.array('images', 10), parseVenueData, venueController.saveDraft); // For initial creation
router.patch('/:id/draft', uploadVenueImage.array('images', 10), parseVenueData, venueController.saveDraft); // For updating draft

// Submission & CRUD Routes
router.post('/', uploadVenueImage.array('images', 10), parseVenueData, validateVenueSubmit, venueController.createVenue);
router.get('/', venueController.getVendorVenues); // Also handles ?status=draft
router.get('/:id', venueController.getVenueById); // Also acts as continueDraft
router.patch('/:id/submit', venueController.submitVenue);
router.patch('/:id', uploadVenueImage.array('images', 10), parseVenueData, validateVenueUpdate, venueController.updateVenue);
router.patch('/:id/block', venueController.blockVenue);
router.patch('/:id/unblock', venueController.unblockVenue);

export default router;
