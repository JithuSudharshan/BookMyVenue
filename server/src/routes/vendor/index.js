import express from "express";

import venueRoutes from "./venue.route.js";

const router = express.Router();

router.use("/venues", venueRoutes);

export default router;
