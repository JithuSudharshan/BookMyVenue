import axiosInstance from '../axiosConfig.js';

/**
 * Fetch Customer Profile from Express Backend
 * @returns {Promise<Object>}
 */
export const getProfile = async () => {
  try {
    const response = await axiosInstance.get('/customer/profile');
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user profile.');
  }
};

/**
 * Update full Customer Profile on Express Backend (legacy)
 * @param {Object} updatedData 
 * @returns {Promise<Object>}
 */
export const updateProfile = async (updatedData) => {
  try {
    const response = await axiosInstance.put('/customer/profile', updatedData);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update user profile.');
  }
};

/**
 * Update Personal Information (firstName, lastName, phone)
 * @param {Object} data - { firstName, lastName, phone }
 * @returns {Promise<Object>}
 */
export const updatePersonalInfo = async (data) => {
  try {
    const response = await axiosInstance.put('/customer/profile/personal', data);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update personal information.');
  }
};

/**
 * Update Address Information
 * @param {Object} data - { street, city, district, state, pinCode, country }
 * @returns {Promise<Object>}
 */
export const updateAddress = async (data) => {
  try {
    const response = await axiosInstance.put('/customer/profile/address', data);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update address.');
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
    const response = await axiosInstance.patch('/customer/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data?.data ?? response.data;
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
    const response = await axiosInstance.delete('/customer/profile/avatar');
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to remove avatar.');
  }
};

