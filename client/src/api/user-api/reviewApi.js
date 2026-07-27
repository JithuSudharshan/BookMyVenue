import axiosInstance from '../axiosConfig.js';

/**
 * Fetch public reviews for a venue (paginated).
 * @param {string} venueId
 * @param {number} page
 * @param {number} limit
 */
export const getVenueReviews = async (venueId, page = 1, limit = 5) => {
  try {
    const response = await axiosInstance.get(`/venues/public/${venueId}/reviews?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reviews.');
  }
};

/**
 * Submit a new review (multipart/form-data with optional images).
 * @param {FormData} formData
 */
export const submitReview = async (formData) => {
  try {
    const response = await axiosInstance.post('/customer/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to submit review.');
  }
};

/**
 * Edit an existing review.
 * @param {string} reviewId
 * @param {FormData} formData
 */
export const editReview = async (reviewId, formData) => {
  try {
    const response = await axiosInstance.put(`/customer/reviews/${reviewId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update review.');
  }
};

/**
 * Delete own review.
 * @param {string} reviewId
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(`/customer/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete review.');
  }
};
