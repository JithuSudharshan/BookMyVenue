import express from "express";
import {
  getAdminBookings,
  getAdminBookingById,
  getAdminBookingStats,
  cancelAdminBooking,
} from "../../controllers/admin/adminBookingController.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { getBookingsSchema, bookingIdParamSchema, cancelBookingSchema } from "../../validators/adminBookingValidator.js";

const router = express.Router();

router.get("/stats", getAdminBookingStats);
router.get("/", validateRequest(getBookingsSchema), getAdminBookings);
router.get("/:id", validateRequest(bookingIdParamSchema), getAdminBookingById);
router.patch("/:id/cancel", validateRequest(cancelBookingSchema), cancelAdminBooking);

export default router;
