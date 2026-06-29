import express from "express";

import {
  adminLogin,
  getUsers,
  getUserById,
  getVendors,
  getVendorById,
  updateUserBlockStatus,
  verifyVendor,
  getDashboardStats,
  getAdminVenues,
  getAdminVenueById,
  updateVenueStatus,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { adminLoginSchema, verifyVendorSchema, mongoIdParamSchema, updateVenueStatusSchema, updateUserBlockStatusSchema } from "../validators/adminValidator.js";

const router = express.Router();

// Public route
router.post("/login", validateRequest(adminLoginSchema), adminLogin);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize("admin", "super_admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/users/:id", validateRequest(mongoIdParamSchema), getUserById);
router.get("/vendors", getVendors);
router.get("/vendors/:id", validateRequest(mongoIdParamSchema), getVendorById);
router.patch("/users/:id/block-status", validateRequest(updateUserBlockStatusSchema), updateUserBlockStatus);
router.patch("/vendors/:id/verify", validateRequest(verifyVendorSchema), verifyVendor);

router.get("/venues", getAdminVenues);
router.get("/venues/:id", validateRequest(mongoIdParamSchema), getAdminVenueById);
router.patch("/venues/:id/status", validateRequest(updateVenueStatusSchema), updateVenueStatus);

export default router;