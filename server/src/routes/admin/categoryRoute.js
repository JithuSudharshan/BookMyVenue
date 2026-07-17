import express from "express";

import {
    createCategory,
    getCategories,
    updateCategory,
    toggleCategoryStatus
} from "../../controllers/admin/categoryController.js";
import { uploadCategoryImage } from "../../utils/uploadMiddleware.js";
import { validateCategory } from "../../validators/categoryValidator.js";

const router = express.Router();

router.post("/", uploadCategoryImage.single("image"), validateCategory, createCategory);

router.get("/", getCategories);

router.patch(
    "/:categoryId",
    uploadCategoryImage.single("image"),
    validateCategory,
    updateCategory
);

router.patch(
    "/:categoryId/status",
    toggleCategoryStatus
);

export default router;