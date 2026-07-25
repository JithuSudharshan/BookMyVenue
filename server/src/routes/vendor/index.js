import express from "express";

import venueRoutes from "./venueRoute.js";

import slotManagementRoutes from './slotManagementRoutes.js';

const router = express.Router();

router.use('/venues/:id/slots', slotManagementRoutes);
router.use("/venues", venueRoutes);

export default router;
