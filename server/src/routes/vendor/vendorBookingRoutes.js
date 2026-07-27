import express from 'express';
import { getVendorBookings, getVendorBookingStats, getVendorVenueList } from '../../controllers/vendorBookingController.js';

const router = express.Router();

router.get('/stats', getVendorBookingStats);
router.get('/venues', getVendorVenueList);
router.get('/', getVendorBookings);

export default router;
