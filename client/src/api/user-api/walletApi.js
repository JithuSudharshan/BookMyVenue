import axiosInstance from '../axiosConfig.js';

/**
 * Fetch wallet balance and paginated transactions
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const fetchWalletDetails = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/wallet?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch wallet details.');
  }
};
