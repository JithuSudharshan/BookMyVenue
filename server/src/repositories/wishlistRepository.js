import Wishlist from '../models/Wishlist.js';

/**
 * Find all wishlist entries for a user.
 */
export const findByUserId = async (userId) => {
  return await Wishlist.find({ userId }).populate('venueId', 'name location images pricing capacity description');
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
