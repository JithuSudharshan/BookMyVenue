import express from "express";
<<<<<<< HEAD
import { protect, authorize } from "../../middlewares/authMiddleware.js";

import authRoutes from "./adminAuthRoutes.js";
import dashboardRoutes from "./adminDashboardRoutes.js";
import userRoutes from "./adminUserRoutes.js";
import vendorRoutes from "./adminVendorRoutes.js";
import venueRoutes from "./adminVenueRoutes.js";
import bookingRoutes from "./adminBookingRoutes.js";

const router = express.Router();

// Public route
router.use("/", authRoutes);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize("admin", "super_admin"));

router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);
router.use("/vendors", vendorRoutes);
router.use("/venues", venueRoutes);
router.use("/bookings", bookingRoutes);

export default router;
=======

import categoryRoutes from "./categoryRoute.js";
import subcategoryRoutes from "./subcategoryRoute.js";

const router = express.Router();

router.use("/categories", categoryRoutes);

router.use("/subcategories", subcategoryRoutes);

export default router;
>>>>>>> origin/dev
