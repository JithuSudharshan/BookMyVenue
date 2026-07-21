import express from "express";

import categoryRoutes from "./categoryRoute.js";
import subcategoryRoutes from "./subcategoryRoute.js";

const router = express.Router();

router.use("/categories", categoryRoutes);

router.use("/subcategories", subcategoryRoutes);

export default router;