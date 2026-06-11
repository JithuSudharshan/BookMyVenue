import * as userService from '../services/userService.js';

// Helper to retrieve active user identifier from request context/headers
const getUserIdFromRequest = (req) => {
  if (req.user && req.user._id) {
    return req.user._id;
  }
  return req.headers['x-user-id'] || req.headers['x-mock-user-id'] || null;
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const userProfile = await userService.getUserProfile(userId);
    res.status(200).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const updatedProfile = await userService.updateUserProfile(userId, req.body);
    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
