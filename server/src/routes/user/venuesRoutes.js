import express from "express";
import { LoadVenues, getPublicAvailability } from "../../controllers/user/venuesController.js";
import { getVenueById } from "../../controllers/venueController.js";

const router = express.Router();

router.get("/", LoadVenues);
router.get("/public/:id", getVenueById);
router.get("/public/:id/availability", getPublicAvailability);

export default router;