import * as paymentService from '../services/paymentService.js';
import AppError from '../utils/appError.js';

/**
 * @desc    Get customer transactions (payments)
 * @route   GET /api/customers/transactions
 * @access  Private
 */
export const getUserTransactions = async (req, res) => {
  try {
    if (!req.user?._id) {
      throw new AppError('Unauthorized. User ID not found.', 401);
    }
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const filter = req.query.filter || 'All';

    const data = await paymentService.getUserPayments(userId, page, limit, filter);

    res.status(200).json({
      success: true,
      data: data.transactions,
      pagination: data.pagination,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

