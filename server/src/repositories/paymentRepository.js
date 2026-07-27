import Payment from '../models/paymentModel.js';
import '../models/venueModel.js'; // Ensure venue is registered for nested population if needed

/**
 * Creates a payment record.
 * @param {Object} paymentData
 * @returns {Promise<Object>}
 */
export const createPayment = async (paymentData) => {
  return await Payment.create(paymentData);
};

/**
 * Fetch paginated payments for a user with optional filter.
 * @param {string} userId
 * @param {number} page
 * @param {number} limit
 * @param {string} filter - 'All', 'Booking Payments', 'Wallet Top-ups', 'Success', 'Failed', 'Pending'
 * @returns {Promise<Object>}
 */
export const getPaymentsByUserId = async (userId, page = 1, limit = 10, filter = 'All') => {
  const skip = (page - 1) * limit;
  const query = { userId };

  if (filter === 'Booking Payments') {
    query.paymentType = 'booking';
  } else if (filter === 'Wallet Top-ups') {
    query.paymentType = 'wallet_topup';
  } else if (filter === 'Success') {
    query.status = 'success';
  } else if (filter === 'Pending') {
    query.status = 'pending';
  }

  const payments = await Payment.find(query)
    .populate({
      path: 'bookingId',
      select: 'bookingDate venueId',
      populate: {
        path: 'venueId',
        select: 'name',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(query);

  return { payments, total };
};
