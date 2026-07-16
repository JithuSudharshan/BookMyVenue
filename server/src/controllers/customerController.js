import * as customerService from '../services/customerService.js';

// Helper to retrieve active user identifier from request context/headers
const getUserIdFromRequest = (req) => {
  if (req.user && req.user._id) {
    return req.user._id;
  }
  return req.headers['x-user-id'] || req.headers['x-mock-user-id'] || null;
};

/**
 * @desc    Get customer profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const profile = await customerService.getCustomerProfile(userId);
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update personal information (firstName, lastName, phone)
 * @route   PUT /api/customers/profile/personal
 * @access  Private
 */
export const updatePersonalInfo = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const updatedProfile = await customerService.updatePersonalInfo(userId, req.body);
    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update address information
 * @route   PUT /api/customers/profile/address
 * @access  Private
 */
export const updateAddress = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const updatedProfile = await customerService.updateAddress(userId, req.body);
    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update customer profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const updatedProfile = await customerService.updateCustomerProfile(userId, req.body);
    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Upload or replace customer profile avatar
 * @route   PATCH /api/profile/avatar
 * @access  Private
 */
export const updateAvatar = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const result = await customerService.updateAvatar(userId, req.file);
    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully.',
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Remove customer profile avatar
 * @route   DELETE /api/profile/avatar
 * @access  Private
 */
export const deleteAvatar = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const result = await customerService.deleteAvatar(userId);
    res.status(200).json({
      success: true,
      message: 'Avatar removed successfully.',
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get customer bookings with pagination
 * @route   GET /api/customers/bookings
 * @access  Private
 */
export const getCustomerBookings = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const filter = req.query.filter || 'All';
    
    const data = await customerService.getBookings(userId, page, limit, filter);
    
    res.status(200).json({
      success: true,
      data: data.bookings,
      pagination: data.pagination
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ─── Wishlist Controllers ──────────────────────────────────────────────────────

/**
 * @desc    Get customer wishlist
 * @route   GET /api/customers/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const data = await customerService.getWishlist(userId, page, limit);
    res.status(200).json({ 
      success: true, 
      data: data.wishlist,
      pagination: data.pagination
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add a venue to customer wishlist
 * @route   POST /api/customers/wishlist/:venueId
 * @access  Private
 */
export const addToWishlist = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { venueId } = req.params;
    const entry = await customerService.addToWishlist(userId, venueId);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Remove a venue from customer wishlist
 * @route   DELETE /api/customers/wishlist/:venueId
 * @access  Private
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { venueId } = req.params;
    const result = await customerService.removeFromWishlist(userId, venueId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
