import express from "express";

import venueRoutes from "./venueRoutes.js";

const router = express.Router();

router.use("/venues", venueRoutes);

export default router;
