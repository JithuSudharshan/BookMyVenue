import express from "express";
import { LoadVenues } from "../../controllers/user/venuesController.js";
import { getVenueById } from "../../controllers/venueController.js";

const router = express.Router();

router.get("/", LoadVenues);
router.get("/public/:id", getVenueById);

export default router;