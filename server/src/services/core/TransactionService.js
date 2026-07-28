import { creditWallet } from '../../repositories/walletRepository.js';
import AppError from '../../utils/AppError.js';

class TransactionService {
  /**
   * Processes a refund back to a user's wallet.
   * Ensures the operation is logged in the wallet ledger via WalletTransaction.
   *
   * @param {string} userId - The customer receiving the refund
   * @param {number} amount - The amount to refund
   * @param {string} referenceId - The Booking ID that triggered the refund
   * @param {string} description - The description for the ledger
   * @returns {Promise<Object>} The transaction details
   */
  async processWalletRefund(userId, amount, referenceId, description) {
    if (!userId || amount <= 0) {
      throw new AppError('Invalid refund parameters for Wallet Credit', 400);
    }

    try {
      const { transaction } = await creditWallet(userId, amount, description, referenceId);
      return transaction;
    } catch (error) {
      console.error('TransactionService [processWalletRefund] failed:', error);
      throw new AppError('Failed to process wallet refund. Please contact support.', 500);
    }
  }

  // Future expansibility: processRazorpayRefund()
}

export default new TransactionService();
