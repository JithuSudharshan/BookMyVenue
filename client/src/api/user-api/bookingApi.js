import axiosInstance from '../axiosConfig.js';

/**
 * Fetch Customer Bookings with Pagination
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getCustomerBookings = async (page = 1, limit = 10, filter = 'All') => {
  try {
    const response = await axiosInstance.get(`/customer/bookings?page=${page}&limit=${limit}&filter=${filter}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch bookings.');
  }
};

/**
 * Cancel a Customer Booking
 * @param {string} bookingId
 * @param {string} reason
 * @returns {Promise<Object>}
 */
export const cancelCustomerBooking = async (bookingId, reason, description = '') => {
  try {
    const response = await axiosInstance.post(`/customer/bookings/${bookingId}/cancel`, {
      reason,
      description
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to cancel booking.');
  }
};
