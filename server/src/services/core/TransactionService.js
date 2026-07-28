import { creditWallet, findOrCreateWallet } from '../../repositories/walletRepository.js';
import AppError from '../../utils/AppError.js';

class TransactionService {
  /**
   * Processes a refund back to a user's wallet.
   * Ensures the operation is logged in the wallet ledger via WalletTransaction.
   *
   * @param {string} userId - The customer receiving the refund
   * @param {number} amount - The amount to refund
   * @param {string} referenceId - The Booking ID that triggered the refund
   * @param {string} referenceType - The Idempotency/Transaction type string
   * @param {string} description - The description for the ledger
   * @param {Object} session - MongoDB session for transaction
   * @returns {Promise<Object>} The transaction details
   */
  async processWalletRefund(userId, amount, referenceId, referenceType, description, session = null) {
    if (!userId || amount <= 0) {
      throw new AppError('Invalid refund parameters for Wallet Credit', 400);
    }

    try {
      // Find or create wallet first (findOrCreateWallet doesn't strictly support session yet, 
      // but if wallet exists, it's fine. For safety, we fetch it via Wallet model in transaction).
      let wallet = await findOrCreateWallet(userId, 'user');
      
      const { transaction } = await creditWallet(wallet._id, amount, description, referenceId, referenceType, session);
      return transaction;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error - idempotency catch
        throw new AppError('This refund has already been processed (Idempotency Key Conflict).', 409);
      }
      console.error('TransactionService [processWalletRefund] failed:', error);
      throw new AppError('Failed to process wallet refund. Please contact support.', 500);
    }
  }

  // Future expansibility: processRazorpayRefund()
}

export default new TransactionService();
