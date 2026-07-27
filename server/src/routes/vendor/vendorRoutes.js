import express from 'express';
import { protect, authorize } from '../../middlewares/authMiddleware.js';
import { uploadProfileImage, uploadIdentityDoc } from '../../middlewares/uploadMiddleware.js';
import { validateStep1, validateStep2, validateStep3 } from '../../validators/vendorOnboardingValidator.js';
import { validateProfileUpdate, validateIdentityUpdate } from '../../validators/vendorProfileValidator.js';
import {
  getOnboardingStatus,
  saveStep1,
  saveStep2,
  saveStep3,
  submitForReview,
  getVendorProfile,
  updateProfile,
  updateIdentity,
  updateAvatar,
  deleteAvatar,
  getDashboardAnalytics
} from '../../controllers/vendorController.js';

const router = express.Router();

// All vendor routes must be protected and restricted to vendor role
router.use(protect);
router.use(authorize('vendor'));

router.get('/onboarding/status', getOnboardingStatus);

router.get('/dashboard/analytics', getDashboardAnalytics);

router.put(
  '/onboarding/step/1',
  uploadProfileImage.single('profileImage'),
  validateStep1,
  saveStep1
);

router.put(
  '/onboarding/step/2',
  validateStep2,
  saveStep2
);

router.put(
  '/onboarding/step/3',
  uploadIdentityDoc.single('identityDocument'),
  validateStep3,
  saveStep3
);

router.post('/onboarding/submit', submitForReview);

router.get('/profile', getVendorProfile);

// Update general profile details (Personal Info & Address)
router.put('/profile', validateProfileUpdate, updateProfile);

// Update/Delete vendor avatar
router
  .route('/profile/avatar')
  .patch(uploadProfileImage.single('profileImage'), updateAvatar)
  .delete(deleteAvatar);

// Update identity details + replace document file in Cloudinary
router.put(
  '/profile/identity',
  uploadIdentityDoc.single('identityDocument'),
  validateIdentityUpdate,
  updateIdentity
);

export default router;
