import { creditWallet, debitWallet, findOrCreateWallet } from '../../repositories/walletRepository.js';
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

  /**
   * Credits the admin wallet with the specified amount.
   * Useful for capturing balance payments and platform fees.
   * 
   * @param {number} amount - The amount to credit
   * @param {string} referenceId - The Booking ID
   * @param {string} referenceType - E.g. 'BalancePayment'
   * @param {string} description - Description for ledger
   * @returns {Promise<Object>}
   */
  async processAdminWalletCredit(amount, referenceId, referenceType, description) {
    if (amount <= 0) return null;

    try {
      // Find the admin user dynamically
      const { default: User } = await import('../../models/userModel.js');
      const adminUser = await User.findOne({ role: 'admin' });
      
      if (!adminUser) {
        console.warn('⚠️ No Admin user found. Cannot credit admin wallet.');
        return null;
      }

      let wallet = await findOrCreateWallet(adminUser._id, 'admin');
      const { transaction } = await creditWallet(wallet._id, amount, description, referenceId, referenceType);
      return transaction;
    } catch (error) {
      if (error.code === 11000) {
        // Idempotency conflict
        console.warn(`Idempotency: Admin wallet credit for ${referenceType} ${referenceId} already processed.`);
        return null;
      }
      console.error('TransactionService [processAdminWalletCredit] failed:', error);
      throw new AppError('Failed to process admin wallet credit', 500);
    }
  }

  /**
   * Debits the admin wallet with the specified amount.
   * Useful for capturing refunds back to customers.
   * 
   * @param {number} amount - The amount to debit
   * @param {string} referenceId - The Booking ID
   * @param {string} referenceType - E.g. 'Refund'
   * @param {string} description - Description for ledger
   * @returns {Promise<Object>}
   */
  async processAdminWalletDebit(amount, referenceId, referenceType, description) {
    if (amount <= 0) return null;

    try {
      const { default: User } = await import('../../models/userModel.js');
      const adminUser = await User.findOne({ role: 'admin' });
      
      if (!adminUser) {
        console.warn('⚠️ No Admin user found. Cannot debit admin wallet.');
        return null;
      }

      let wallet = await findOrCreateWallet(adminUser._id, 'admin');
      const { transaction } = await debitWallet(wallet._id, amount, description, referenceId, referenceType);
      return transaction;
    } catch (error) {
      if (error.code === 11000) {
        // Idempotency conflict
        console.warn(`Idempotency: Admin wallet debit for ${referenceType} ${referenceId} already processed.`);
        return null;
      }
      console.error('TransactionService [processAdminWalletDebit] failed:', error);
      // We don't throw an error here because if the admin's wallet has insufficient balance (e.g. testing) 
      // we shouldn't block the customer's refund.
      return null;
    }
  }

  // Future expansibility: processRazorpayRefund()
}

export default new TransactionService();
