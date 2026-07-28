import express from 'express';
import { getVendorBookings, getVendorBookingStats, getVendorVenueList, cancelVendorBooking } from '../../controllers/vendorBookingController.js';

const router = express.Router();

router.get('/stats', getVendorBookingStats);
router.get('/venues', getVendorVenueList);
router.get('/', getVendorBookings);
router.post('/:id/cancel', cancelVendorBooking);

export default router;
