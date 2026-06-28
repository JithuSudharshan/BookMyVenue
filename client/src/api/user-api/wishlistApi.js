import axiosInstance from '../axiosConfig.js';

/**
 * Fetch the customer's wishlist
 * @returns {Promise<Object>}
 */
export const getWishlist = async () => {
  try {
    const response = await axiosInstance.get('/customer/wishlist');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch wishlist.');
  }
};

/**
 * Add a venue to the wishlist
 * @param {string} venueId
 * @returns {Promise<Object>}
 */
export const addToWishlist = async (venueId) => {
  try {
    const response = await axiosInstance.post(`/customer/wishlist/${venueId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to add to wishlist.');
  }
};

/**
 * Remove a venue from the wishlist
 * @param {string} venueId
 * @returns {Promise<Object>}
 */
export const removeFromWishlist = async (venueId) => {
  try {
    const response = await axiosInstance.delete(`/customer/wishlist/${venueId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to remove from wishlist.');
  }
};
