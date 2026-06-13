import express from "express";

import {
  adminLogin,
  getUsers,
  getVendors,
  blockUser,
  unblockUser,
  verifyVendor,
  getDashboardStats,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { adminLoginSchema, verifyVendorSchema, mongoIdParamSchema } from "../validators/adminValidator.js";

const router = express.Router();

// Public route
router.post("/login", validateRequest(adminLoginSchema), adminLogin);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize("admin", "super_admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/vendors", getVendors);
router.patch("/users/:id/block", validateRequest(mongoIdParamSchema), blockUser);
router.patch("/users/:id/unblock", validateRequest(mongoIdParamSchema), unblockUser);
router.patch("/vendors/:id/verify", validateRequest(verifyVendorSchema), verifyVendor);

export default router;