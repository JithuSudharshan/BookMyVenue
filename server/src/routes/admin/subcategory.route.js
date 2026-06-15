import express from "express";

import {
    createSubcategory,
    getSubcategories
} from "../../controllers/admin/subcategory.controller.js";

const router = express.Router();

router.post("/", createSubcategory);

router.get("/", getSubcategories);

export default router;