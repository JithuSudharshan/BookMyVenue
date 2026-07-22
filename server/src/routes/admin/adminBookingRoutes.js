import express from "express";
import {
  getAdminBookings,
  getAdminBookingById,
  getAdminBookingStats,
} from "../../controllers/admin/adminBookingController.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { getBookingsSchema, bookingIdParamSchema } from "../../validators/adminBookingValidator.js";

const router = express.Router();

router.get("/stats", getAdminBookingStats);
router.get("/", validateRequest(getBookingsSchema), getAdminBookings);
router.get("/:id", validateRequest(bookingIdParamSchema), getAdminBookingById);

export default router;
