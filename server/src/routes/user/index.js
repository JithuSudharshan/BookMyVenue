import express from "express";

import homeRoutes from "./home.route.js";
import venueRoutes from "./venues.route.js"

const router = express.Router();

router.use("/home", homeRoutes);
router.use("/venues", venueRoutes);

export default router;