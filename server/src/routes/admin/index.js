import express from "express";
import { adminProtect } from "../../middlewares/adminAuthMiddleware.js";

import authRoutes from "./adminAuthRoutes.js";
import dashboardRoutes from "./adminDashboardRoutes.js";
import userRoutes from "./adminUserRoutes.js";
import vendorRoutes from "./adminVendorRoutes.js";
import venueRoutes from "./adminVenueRoutes.js";
import bookingRoutes from "./adminBookingRoutes.js";
import categoryRoutes from "./categoryRoute.js";
import subcategoryRoutes from "./subcategoryRoute.js";
<<<<<<< HEAD
import walletRoutes from "./adminWalletRoutes.js";
=======
import { adminDeleteReview } from "../../controllers/reviewController.js";
>>>>>>> origin/dev-sreesha

const router = express.Router();

// Public route
router.use("/", authRoutes);

// Protected routes (Admin only)
// Skip auth for OPTIONS preflight requests — browsers send them without a token
router.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  return adminProtect(req, res, next);
});


router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);
router.use("/vendors", vendorRoutes);
router.use("/venues", venueRoutes);
router.use("/bookings", bookingRoutes);
router.use("/categories", categoryRoutes);
router.use("/subcategories", subcategoryRoutes);
router.use("/wallet", walletRoutes);
router.delete("/reviews/:reviewId", adminDeleteReview);

export default router;
