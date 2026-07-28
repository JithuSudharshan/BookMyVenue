import axiosInstance from '../axiosConfig.js';

/**
 * Fetch Customer Transactions with Pagination
 * @param {number} page
 * @param {number} limit
 * @param {string} filter
 * @returns {Promise<Object>}
 */
export const getCustomerTransactions = async (page = 1, limit = 10, filter = 'All') => {
  try {
    const response = await axiosInstance.get(`/customer/transactions?page=${page}&limit=${limit}&filter=${filter}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch transactions.');
  }
};
