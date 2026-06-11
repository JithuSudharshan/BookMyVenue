import * as userRepository from '../repositories/userRepository.js';
import cloudinary from '../config/cloudinary.js';

// Helper to retrieve active user identifier from request context/headers
const getUserIdFromRequest = (req) => {
  if (req.user && req.user._id) {
    return req.user._id;
  }
  return req.headers['x-user-id'] || req.headers['x-mock-user-id'] || null;
};

// Extract Cloudinary public ID from secure URL
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
 * @desc    Upload or replace user profile avatar
 * @route   PATCH /api/profile/avatar
 * @access  Private
 */
export const updateAvatar = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User ID not found.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file.' });
    }

    const imageUrl = req.file.path || req.file.secure_url;
    
    // Retrieve user and check if they already have an avatar to delete
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.profileImage) {
      const oldPublicId = extractPublicId(user.profileImage);
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (destroyError) {
          console.error('Failed to destroy old Cloudinary image:', destroyError);
        }
      }
    }

    // Save new avatar URL to database
    user.profileImage = imageUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully.',
      data: {
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Remove user profile avatar
 * @route   DELETE /api/profile/avatar
 * @access  Private
 */
export const deleteAvatar = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User ID not found.' });
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.profileImage) {
      const publicId = extractPublicId(user.profileImage);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (destroyError) {
          console.error('Failed to destroy Cloudinary image:', destroyError);
        }
      }
      user.profileImage = '';
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Avatar removed successfully.',
      data: {
        profileImage: ''
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
