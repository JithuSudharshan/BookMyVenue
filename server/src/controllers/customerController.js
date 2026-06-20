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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
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
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
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
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};
