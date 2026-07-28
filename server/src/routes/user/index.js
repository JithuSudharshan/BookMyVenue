import express from "express";

import homeRoutes from "./homeRoutes.js";
import venueRoutes from "./venuesRoutes.js"
import bookingRoutes from "./bookingRoutes.js";

const router = express.Router();

router.use("/home", homeRoutes);
router.use("/venues", venueRoutes);
router.use("/bookings", bookingRoutes);

export default router;