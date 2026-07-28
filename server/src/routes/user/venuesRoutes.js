import express from "express";
import { LoadVenues, getPublicAvailability } from "../../controllers/user/venuesController.js";
import { getVenueById } from "../../controllers/venueController.js";
import { getVenueReviews } from "../../controllers/reviewController.js";

const router = express.Router();

router.get("/", LoadVenues);
router.get("/public/:id", getVenueById);
router.get("/public/:id/availability", getPublicAvailability);
router.get("/public/:venueId/reviews", getVenueReviews);

export default router;