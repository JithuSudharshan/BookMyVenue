import * as paymentRepository from '../repositories/paymentRepository.js';
import AppError from '../utils/AppError.js';

/**
 * Fetch paginated payments for a user.
 * @param {string} userId
 * @param {number} page
 * @param {number} limit
 * @param {string} filter
 * @returns {Promise<Object>}
 */
export const getUserPayments = async (userId, page = 1, limit = 10, filter = 'All') => {
  if (!userId) {
    throw new AppError('Unauthorized. User ID not found.', 401);
  }

  const { payments, total } = await paymentRepository.getPaymentsByUserId(userId, page, limit, filter);
  const totalPages = Math.ceil(total / limit);

  return {
    transactions: payments,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};
