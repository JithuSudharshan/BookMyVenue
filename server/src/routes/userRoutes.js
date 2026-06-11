import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { validateBody } from '../middlewares/validationMiddleware.js';
import { updateProfileSchema } from '../validations/userValidation.js';

const router = express.Router();

// Route: /api/users/profile
router
  .route('/profile')
  .get(getUserProfile)
  .put(validateBody(updateProfileSchema), updateUserProfile);

export default router;
