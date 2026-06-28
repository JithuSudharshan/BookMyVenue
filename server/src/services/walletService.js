import * as walletRepository from '../repositories/walletRepository.js';
import AppError from '../utils/AppError.js';

/**
 * Get the wallet and paginated transactions for a user.
 * Creates the wallet automatically if it doesn't exist yet.
 * @param {string} userId
 * @param {string} ownerType - 'customer' | 'vendor'
 * @param {number} page
 * @param {number} limit
 */
export const getWalletData = async (userId, ownerType, page = 1, limit = 10) => {
  if (!userId) throw new AppError('Unauthorized. User ID not found.', 401);

  const wallet = await walletRepository.findOrCreateWallet(userId, ownerType);
  const { transactions, total } = await walletRepository.getTransactions(wallet._id, page, limit);

  const totalPages = Math.ceil(total / limit);

  return {
    wallet,
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};
