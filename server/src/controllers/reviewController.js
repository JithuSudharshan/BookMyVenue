import * as reviewService from '../services/reviewService.js';

const getUserIdFromRequest = (req) => {
  if (req.user && req.user._id) return req.user._id;
  return req.headers['x-user-id'] || null;
};

/**
 * @desc    Submit a review for a completed booking
 * @route   POST /api/customer/reviews
 * @access  Private (customer)
 */
export const submitReview = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const review = await reviewService.submitReview(userId, req.body, req.files || []);
    res.status(201).json({ success: true, message: 'Review submitted successfully.', data: review });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Edit own review
 * @route   PUT /api/customer/reviews/:reviewId
 * @access  Private (customer)
 */
export const editReview = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const review = await reviewService.editReview(userId, req.params.reviewId, req.body, req.files || []);
    res.status(200).json({ success: true, message: 'Review updated successfully.', data: review });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete own review
 * @route   DELETE /api/customer/reviews/:reviewId
 * @access  Private (customer)
 */
export const deleteOwnReview = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const result = await reviewService.deleteOwnReview(userId, req.params.reviewId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get public reviews for a venue
 * @route   GET /api/venues/public/:venueId/reviews
 * @access  Public
 */
export const getVenueReviews = async (req, res) => {
  try {
    const { venueId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const data = await reviewService.getVenueReviews(venueId, page, limit);
    res.status(200).json({ success: true, data: data.reviews, ratingSummary: data.ratingSummary, pagination: data.pagination });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all reviews for a vendor's venues
 * @route   GET /api/vendor/venues/reviews
 * @access  Private (vendor)
 */
export const getVendorReviews = async (req, res) => {
  try {
    const vendorId = getUserIdFromRequest(req);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await reviewService.getVendorReviews(vendorId, page, limit);
    res.status(200).json({ success: true, data: data.reviews, pagination: data.pagination });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: delete any review
 * @route   DELETE /api/admin/reviews/:reviewId
 * @access  Private (admin)
 */
export const adminDeleteReview = async (req, res) => {
  try {
    const result = await reviewService.adminDeleteReview(req.params.reviewId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
