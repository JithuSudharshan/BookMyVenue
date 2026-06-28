import Wallet from '../models/Wallet.js';
import WalletTransaction from '../models/WalletTransaction.js';

/**
 * Find a wallet by ownerId, or create one if it doesn't exist.
 */
export const findOrCreateWallet = async (ownerId, ownerType) => {
  let wallet = await Wallet.findOne({ ownerId });
  if (!wallet) {
    wallet = await Wallet.create({ ownerId, ownerType, currentBalance: 0 });
  }
  return wallet;
};

/**
 * Get paginated transactions for a wallet.
 */
export const getTransactions = async (walletId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const transactions = await WalletTransaction.find({ walletId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await WalletTransaction.countDocuments({ walletId });
  return { transactions, total };
};

/**
 * Credit a wallet by adding amount.
 */
export const creditWallet = async (walletId, amount, description, referenceId = null) => {
  const wallet = await Wallet.findByIdAndUpdate(
    walletId,
    { $inc: { currentBalance: amount } },
    { new: true }
  );

  const transaction = await WalletTransaction.create({
    walletId,
    transactionType: 'Credit',
    amount,
    description,
    referenceId,
  });

  return { wallet, transaction };
};

/**
 * Debit a wallet by subtracting amount (with balance check).
 */
export const debitWallet = async (walletId, amount, description, referenceId = null) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet || wallet.currentBalance < amount) {
    throw new Error('Insufficient wallet balance.');
  }

  const updatedWallet = await Wallet.findByIdAndUpdate(
    walletId,
    { $inc: { currentBalance: -amount } },
    { new: true }
  );

  const transaction = await WalletTransaction.create({
    walletId,
    transactionType: 'Debit',
    amount,
    description,
    referenceId,
  });

  return { wallet: updatedWallet, transaction };
};
