import Booking from '../models/bookingModel.js';
import Venue from '../models/venueModel.js';
import cloudinary from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';
import * as reviewRepository from '../repositories/reviewRepository.js';

/**
 * Extract Cloudinary public ID from a secure URL.
 */
const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/upload/');
  if (parts.length < 2) return null;
  const afterUpload = parts[1];
  const versionMatch = afterUpload.match(/^v\d+\/(.+)$/);
  const relativePath = versionMatch ? versionMatch[1] : afterUpload;
  return relativePath.split('.').slice(0, -1).join('.');
};

/**
 * Delete an array of review image objects from Cloudinary.
 */
const deleteReviewImagesFromCloudinary = async (images = []) => {
  for (const img of images) {
    const publicId = img.publicId || extractPublicId(img.url);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Failed to delete review image from Cloudinary:', err.message);
      }
    }
  }
};

/**
 * Recalculate and update the aggregate rating and review count on the Venue model.
 */
const updateVenueRatingSummary = async (venueId) => {
  if (!venueId) return;
  try {
    const summary = await reviewRepository.getVenueRatingSummary(venueId);
    await Venue.findByIdAndUpdate(venueId, {
      rating: summary.averageRating,
      reviews: summary.totalReviews,
    });
  } catch (err) {
    console.error('Failed to update venue rating summary:', err.message);
  }
};

/**
 * Submit a new review for a completed booking.
 */
export const submitReview = async (userId, data, files = []) => {
  if (!userId) throw new AppError('Unauthorized.', 401);

  const { bookingId, rating, comment } = data;

  // 1. Verify booking exists, belongs to this user, and is Completed
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found.', 404);
  if (booking.userId.toString() !== userId.toString()) {
    throw new AppError('You are not authorized to review this booking.', 403);
  }
  if (booking.bookingStatus !== 'Completed') {
    throw new AppError('You can only review completed bookings.', 400);
  }

  // 2. Check if a review already exists for this booking
  const existing = await reviewRepository.findReviewByBookingId(bookingId);
  if (existing) throw new AppError('You have already reviewed this booking.', 409);

  // 3. Resolve vendorId from the venue
  const venue = await Venue.findById(booking.venueId).select('vendorId');
  if (!venue) throw new AppError('Associated venue not found.', 404);

  // 4. Build image objects from uploaded files
  const images = files.map((file) => ({
    url: file.path || file.secure_url,
    publicId: file.filename || extractPublicId(file.path || file.secure_url) || '',
  }));

  // 5. Create the review
  const review = await reviewRepository.createReview({
    userId,
    venueId: booking.venueId,
    vendorId: venue.vendorId,
    bookingId,
    rating: Number(rating),
    comment: comment || undefined,
    images,
  });

  await updateVenueRatingSummary(booking.venueId);

  return review;
};

/**
 * Edit an existing review (customer only, own review).
 */
export const editReview = async (userId, reviewId, data, files = []) => {
  if (!userId) throw new AppError('Unauthorized.', 401);

  const review = await reviewRepository.findReviewByIdAndUserId(reviewId, userId);
  if (!review) throw new AppError('Review not found or you do not have permission to edit it.', 404);

  const { rating, comment } = data;

  // Delete old images from Cloudinary if new images are being uploaded
  if (files.length > 0 && review.images.length > 0) {
    await deleteReviewImagesFromCloudinary(review.images);
  }

  const updateData = {};
  if (rating !== undefined) updateData.rating = Number(rating);
  if (comment !== undefined) updateData.comment = comment;
  if (files.length > 0) {
    updateData.images = files.map((file) => ({
      url: file.path || file.secure_url,
      publicId: file.filename || extractPublicId(file.path || file.secure_url) || '',
    }));
  }

  const updatedReview = await reviewRepository.updateReview(reviewId, updateData);
  await updateVenueRatingSummary(review.venueId);
  return updatedReview;
};

/**
 * Delete own review (customer).
 */
export const deleteOwnReview = async (userId, reviewId) => {
  if (!userId) throw new AppError('Unauthorized.', 401);

  const review = await reviewRepository.findReviewByIdAndUserId(reviewId, userId);
  if (!review) throw new AppError('Review not found or you do not have permission to delete it.', 404);

  await deleteReviewImagesFromCloudinary(review.images);
  await reviewRepository.deleteReview(reviewId);
  await updateVenueRatingSummary(review.venueId);

  return { message: 'Review deleted successfully.' };
};

/**
 * Get paginated public reviews for a venue.
 */
export const getVenueReviews = async (venueId, page = 1, limit = 5) => {
  const skip = (page - 1) * limit;
  const [reviews, total, ratingSummary] = await Promise.all([
    reviewRepository.findReviewsByVenueId(venueId, skip, limit),
    reviewRepository.countReviewsByVenueId(venueId),
    reviewRepository.getVenueRatingSummary(venueId),
  ]);

  return {
    reviews,
    ratingSummary,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get paginated reviews for all venues owned by a vendor.
 */
export const getVendorReviews = async (vendorId, page = 1, limit = 10) => {
  if (!vendorId) throw new AppError('Unauthorized.', 401);

  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    reviewRepository.findReviewsByVendorId(vendorId, skip, limit),
    reviewRepository.countReviewsByVendorId(vendorId),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Admin: delete any review.
 */
export const adminDeleteReview = async (reviewId) => {
  const review = await reviewRepository.deleteReview(reviewId);
  if (!review) throw new AppError('Review not found.', 404);

  await deleteReviewImagesFromCloudinary(review.images || []);
  await updateVenueRatingSummary(review.venueId);

  return { message: 'Review deleted successfully.' };
};
