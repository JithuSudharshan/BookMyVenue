import express from "express";
import { adminLogin } from "../../controllers/admin/adminAuthController.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { adminLoginSchema } from "../../validators/adminValidator.js";

const router = express.Router();

router.post("/login", validateRequest(adminLoginSchema), adminLogin);

export default router;
