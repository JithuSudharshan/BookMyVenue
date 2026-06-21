import express from "express";

import categoryRoutes from "./category.route.js";
import subcategoryRoutes from "./subcategory.route.js";

const router = express.Router();

router.use("/categories", categoryRoutes);

router.use("/subcategories", subcategoryRoutes);

export default router;