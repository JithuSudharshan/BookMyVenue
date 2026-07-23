import express from "express";
import { adminLogin, getAdminMe } from "../../controllers/admin/adminAuthController.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { adminLoginSchema } from "../../validators/adminValidator.js";
import { adminProtect } from "../../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/login", validateRequest(adminLoginSchema), adminLogin);
router.get("/me", adminProtect, getAdminMe);

export default router;
