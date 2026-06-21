import express from "express";

import {
    createCategory,
    getCategories,
    updateCategory,
    toggleCategoryStatus
} from "../../controllers/admin/category.controller.js";

const router = express.Router();

router.post("/", createCategory);

router.get("/", getCategories);

router.patch(
    "/:categoryId",
    updateCategory
);

router.patch(
    "/:categoryId/status",
    toggleCategoryStatus
);

export default router;