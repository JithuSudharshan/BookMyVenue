import * as walletService from '../../services/walletService.js';

/**
 * @desc    Get admin's own wallet balance and transactions
 * @route   GET /api/admin/wallet
 * @access  Private (Admin)
 */
export const getAdminWallet = async (req, res) => {
  try {
    const adminId = req.user._id;
    const ownerType = 'admin';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const filter = req.query.filter || 'All';

    const data = await walletService.getWalletData(adminId, ownerType, page, limit, filter);

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
