import express from "express";

import {
    createSubcategory,
    updateSubcategory,
    toggleSubcategoryStatus,
    deleteSubcategory
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

router.delete("/:subcategoryId", deleteSubcategory);

export default router;