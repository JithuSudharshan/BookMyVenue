import express from "express";

import {
    createSubcategory,
    getSubcategories,
    updateSubcategory,
    toggleSubcategoryStatus
} from "../../controllers/admin/subcategoryController.js";

const router = express.Router();

router.post("/", createSubcategory);

router.get("/", getSubcategories);

router.patch(
    "/:subcategoryId",
    updateSubcategory
);

router.patch(
    "/:subcategoryId/status",
    toggleSubcategoryStatus
);

export default router;