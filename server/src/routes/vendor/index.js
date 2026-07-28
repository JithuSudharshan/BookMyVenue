import express from "express";
import venueRoutes from "./venueRoute.js";
import availabilityRoutes from './availabilityRoutes.js';
import vendorBookingRoutes from './vendorBookingRoutes.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('vendor'));

router.use('/venues/:id/availability', availabilityRoutes);
router.use("/venues", venueRoutes);
router.use('/bookings', vendorBookingRoutes);

export default router;
