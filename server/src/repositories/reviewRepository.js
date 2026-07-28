import mongoose from 'mongoose';
import Review from '../models/reviewModel.js';

export const createReview = async (data) => {
  const review = new Review(data);
  return await review.save();
};

export const findReviewByBookingId = async (bookingId) => {
  return await Review.findOne({ bookingId });
};

export const findReviewsByVenueId = async (venueId, skip = 0, limit = 5) => {
  return await Review.find({ venueId, isVisible: true })
    .populate({
      path: 'userId',
      select: 'email',
      populate: {
        path: 'profile',
        select: 'firstName lastName profileImage',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const countReviewsByVenueId = async (venueId) => {
  return await Review.countDocuments({ venueId, isVisible: true });
};

export const findReviewsByVendorId = async (vendorId, skip = 0, limit = 10) => {
  return await Review.find({ vendorId })
    .populate({
      path: 'userId',
      select: 'email',
      populate: {
        path: 'profile',
        select: 'firstName lastName profileImage',
      },
    })
    .populate('venueId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const countReviewsByVendorId = async (vendorId) => {
  return await Review.countDocuments({ vendorId });
};

export const findReviewByIdAndUserId = async (reviewId, userId) => {
  return await Review.findOne({ _id: reviewId, userId });
};

export const updateReview = async (reviewId, data) => {
  return await Review.findByIdAndUpdate(reviewId, { $set: data }, { new: true, runValidators: true });
};

export const deleteReview = async (reviewId) => {
  return await Review.findByIdAndDelete(reviewId);
};

export const getVenueRatingSummary = async (venueId) => {
  const result = await Review.aggregate([
    { $match: { venueId: new mongoose.Types.ObjectId(venueId), isVisible: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (!result.length) {
    return { averageRating: 0, totalReviews: 0 };
  }

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalReviews: result[0].totalReviews,
  };
};
