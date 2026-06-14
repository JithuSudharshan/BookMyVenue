import express from "express";

import homeRoutes from "./home.route.js";

const router = express.Router();

router.use("/home", homeRoutes);

export default router;