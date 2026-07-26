import express from 'express';
import { getUserProfile, updateUserProfile, updatePersonalInfo, updateAddress, updateAvatar, deleteAvatar, getCustomerBookings, getWishlist, addToWishlist, removeFromWishlist } from '../../controllers/customerController.js';
import { submitReview, editReview, deleteOwnReview } from '../../controllers/reviewController.js';
import { validateBody } from '../../middlewares/validationMiddleware.js';
import { customerProfileSchema, personalInfoSchema, addressSchema } from '../../validators/customerValidator.js';
import { uploadAvatarMiddleware, handleUploadError, uploadReviewImages } from '../../middlewares/uploadMiddleware.js';
import { submitReviewSchema, editReviewSchema } from '../../validators/reviewValidator.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Secure all endpoints under this router
router.use(protect);
router.use(authorize('customer'));

// Route: /api/customers/profile
router
  .route('/profile')
  .get(getUserProfile)
  .put(validateBody(customerProfileSchema), updateUserProfile);

// Route: /api/customers/profile/personal
router.put('/profile/personal', validateBody(personalInfoSchema), updatePersonalInfo);

// Route: /api/customers/profile/address
router.put('/profile/address', validateBody(addressSchema), updateAddress);

// Route: /api/customers/profile/avatar
router
  .route('/profile/avatar')
  .patch(uploadAvatarMiddleware, handleUploadError, updateAvatar)
  .delete(deleteAvatar);

// Route: /api/customers/bookings
router.get('/bookings', getCustomerBookings);

// Routes: /api/customers/wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist/:venueId', addToWishlist);
router.delete('/wishlist/:venueId', removeFromWishlist);

// Routes: /api/customer/reviews
router.post('/reviews', uploadReviewImages, handleUploadError, validateBody(submitReviewSchema), submitReview);
router.put('/reviews/:reviewId', uploadReviewImages, handleUploadError, validateBody(editReviewSchema), editReview);
router.delete('/reviews/:reviewId', deleteOwnReview);

export default router;
