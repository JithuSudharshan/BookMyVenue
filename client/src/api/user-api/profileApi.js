import axiosInstance from '../axiosConfig.js';

/**
 * Fetch Customer Profile from Express Backend
 * @returns {Promise<Object>}
 */
export const getProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user profile.');
  }
};

/**
 * Update Customer Profile on Express Backend
 * @param {Object} updatedData 
 * @returns {Promise<Object>}
 */
export const updateProfile = async (updatedData) => {
  try {
    const response = await axiosInstance.put('/users/profile', updatedData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update user profile.');
  }
};

/**
 * Upload Cropped Avatar File to Cloudinary via Express Backend
 * @param {File} file 
 * @returns {Promise<Object>}
 */
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axiosInstance.patch('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload avatar.');
  }
};

/**
 * Remove Avatar Image from Cloudinary and DB
 * @returns {Promise<Object>}
 */
export const deleteAvatar = async () => {
  try {
    const response = await axiosInstance.delete('/profile/avatar');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to remove avatar.');
  }
};
