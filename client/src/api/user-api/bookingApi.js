import axiosInstance from '../axiosConfig.js';

/**
 * Fetch Customer Bookings with Pagination
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getCustomerBookings = async (page = 1, limit = 10, filter = 'All', search = '', bookingMode = '') => {
  try {
    let url = `/customer/bookings?page=${page}&limit=${limit}&filter=${filter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (bookingMode) url += `&bookingMode=${encodeURIComponent(bookingMode)}`;
    
    const response = await axiosInstance.get(url);
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

/**
 * Initiate balance payment for a booking.
 */
export const payBalancePayment = async (bookingId) => {
  try {
    const response = await axiosInstance.post(`/bookings/${bookingId}/pay-balance`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to initiate balance payment.');
  }
};

/**
 * Verify Razorpay payment for balance.
 */
export const verifyBalancePayment = async (bookingId, verificationData) => {
  try {
    const response = await axiosInstance.post(`/bookings/payment/verify-balance/${bookingId}`, verificationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to verify balance payment.');
  }
};
