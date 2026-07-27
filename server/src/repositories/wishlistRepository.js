import Wishlist from '../models/wishlistModel.js';

/**
 * Find all wishlist entries for a user.
 */
export const findByUserId = async (userId, skip = 0, limit = 20) => {
  return await Wishlist.find({ userId })
    .populate('venueId', 'name slug location images price capacity amenities bookingModel venueStatus subcategoryId averageRating totalReviews')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const countByUserId = async (userId) => {
  return await Wishlist.countDocuments({ userId });
};

/**
 * Find a single wishlist entry by user + venue.
 */
export const findOne = async (userId, venueId) => {
  return await Wishlist.findOne({ userId, venueId });
};

/**
 * Add a venue to the wishlist.
 */
export const create = async (userId, venueId) => {
  return await Wishlist.create({ userId, venueId });
};

/**
 * Remove a venue from the wishlist.
 */
export const deleteOne = async (userId, venueId) => {
  return await Wishlist.findOneAndDelete({ userId, venueId });
};
