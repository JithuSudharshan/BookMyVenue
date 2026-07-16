import express from "express";

import homeRoutes from "./homeRoutes.js";
import venueRoutes from "./venuesRoutes.js"

const router = express.Router();

router.use("/home", homeRoutes);
router.use("/venues", venueRoutes);

export default router;