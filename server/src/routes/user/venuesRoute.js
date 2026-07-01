import express from "express";
import { LoadVenues } from "../../controllers/user/venuesController.js";

const router = express.Router();

router.get("/", LoadVenues);

export default router;