import express from 'express';
import { getVendorBookings, getVendorBookingStats, getVendorVenueList, cancelVendorBooking, requestBalance, markAsCompleted } from '../../controllers/vendorBookingController.js';

const router = express.Router();

router.get('/stats', getVendorBookingStats);
router.get('/venues', getVendorVenueList);
router.get('/', getVendorBookings);
router.post('/:id/cancel', cancelVendorBooking);
router.post('/:id/request-balance', requestBalance);
router.patch('/:id/complete', markAsCompleted);

export default router;
