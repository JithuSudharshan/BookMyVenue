import axiosInstance from '../axiosConfig.js';

/**
 * Fetch Customer Bookings with Pagination
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getCustomerBookings = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/customer/bookings?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch bookings.');
  }
};
