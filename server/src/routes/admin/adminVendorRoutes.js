import express from "express";
import {
  getVendors,
  getVendorById,
  verifyVendor,
} from "../../controllers/admin/adminVendorController.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { mongoIdParamSchema, verifyVendorSchema } from "../../validators/adminValidator.js";

const router = express.Router();

router.get("/", getVendors);
router.get("/:id", validateRequest(mongoIdParamSchema), getVendorById);
router.patch("/:id/verify", validateRequest(verifyVendorSchema), verifyVendor);

export default router;
