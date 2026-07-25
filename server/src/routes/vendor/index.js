import express from "express";
import venueRoutes from "./venueRoute.js";
import slotManagementRoutes from './slotManagementRoutes.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('vendor'));

router.use('/venues/:id/slots', slotManagementRoutes);
router.use("/venues", venueRoutes);

export default router;
