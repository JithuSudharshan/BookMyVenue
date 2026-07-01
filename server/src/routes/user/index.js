import express from "express";

import homeRoutes from "./homeRoute.js";
import venueRoutes from "./venuesRoute.js"

const router = express.Router();

router.use("/home", homeRoutes);
router.use("/venues", venueRoutes);

export default router;