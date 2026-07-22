import express from "express";
import {
  getAdminVenues,
  getAdminVenueById,
  updateVenueStatus,
  updateVenueVisibility,
} from "../../controllers/admin/adminVenueController.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { mongoIdParamSchema, updateVenueStatusSchema, updateVenueVisibilitySchema } from "../../validators/adminValidator.js";

const router = express.Router();

router.get("/", getAdminVenues);
router.get("/:id", validateRequest(mongoIdParamSchema), getAdminVenueById);
router.patch("/:id/status", validateRequest(updateVenueStatusSchema), updateVenueStatus);
router.patch("/:id/visibility", validateRequest(updateVenueVisibilitySchema), updateVenueVisibility);

export default router;
