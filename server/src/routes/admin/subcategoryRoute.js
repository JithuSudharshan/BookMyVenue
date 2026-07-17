import express from "express";

import {
    createSubcategory,
    updateSubcategory,
    toggleSubcategoryStatus
} from "../../controllers/admin/subcategoryController.js";
import { validateSubcategory } from "../../validators/categoryValidator.js";

const router = express.Router();

router.post("/", validateSubcategory, createSubcategory);

router.patch(
    "/:subcategoryId",
    validateSubcategory,
    updateSubcategory
);

router.patch(
    "/:subcategoryId/status",
    toggleSubcategoryStatus
);

export default router;