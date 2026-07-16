import express from "express";

import categoryRoutes from "./categoryRoutes.js";
import subcategoryRoutes from "./subcategoryRoutes.js";

const router = express.Router();

router.use("/categories", categoryRoutes);

router.use("/subcategories", subcategoryRoutes);

export default router;