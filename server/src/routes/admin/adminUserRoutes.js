import express from "express";
import {
  getUsers,
  getUserById,
  updateUserBlockStatus,
} from "../../controllers/admin/adminUserController.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { mongoIdParamSchema, updateUserBlockStatusSchema } from "../../validators/adminValidator.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", validateRequest(mongoIdParamSchema), getUserById);
router.patch("/:id/block-status", validateRequest(updateUserBlockStatusSchema), updateUserBlockStatus);

export default router;
