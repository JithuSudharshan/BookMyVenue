import express from "express";

<<<<<<< HEAD
import homeRoutes from "./homeRoute.js";
import venueRoutes from "./venuesRoute.js"
=======
import homeRoutes from "./homeRoutes.js";
import venueRoutes from "./venuesRoutes.js"
>>>>>>> origin/dev

const router = express.Router();

router.use("/home", homeRoutes);
router.use("/venues", venueRoutes);

export default router;