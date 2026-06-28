import * as walletService from '../services/walletService.js';

const getUserIdFromRequest = (req) => {
  if (req.user && req.user._id) return req.user._id;
  return req.headers['x-user-id'] || req.headers['x-mock-user-id'] || null;
};

/**
 * @desc    Get wallet balance and transactions for the authenticated user
 * @route   GET /api/wallet
 * @access  Private
 */
export const getWalletDetails = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const ownerType = req.user?.role || 'customer';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const data = await walletService.getWalletData(userId, ownerType, page, limit);

    res.status(200).json({
      success: true,
      data: {
        wallet: data.wallet,
        transactions: data.transactions,
      },
      pagination: data.pagination,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
