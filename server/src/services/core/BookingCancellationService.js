import Booking from '../../models/bookingModel.js';
import AvailabilityOverride from '../../models/availabilityOverrideModel.js';
import CancellationPolicyEngine from './CancellationPolicyEngine.js';
import RefundEngine from './RefundEngine.js';
import { creditWallet } from '../../repositories/walletRepository.js';
import notificationService from '../notificationService.js';
import { 
  BOOKING_STATUS, 
  PAYMENT_STATUS, 
  REFUND_DESTINATION,
  NOTIFICATION_EVENTS
} from '../../utils/bookingConstants.js';
import AppError from '../../utils/AppError.js';

class BookingCancellationService {
  /**
   * Orchestrates the cancellation of a booking across all business domains.
   * This is a transactional-style flow ensuring financial consistency.
   * 
   * @param {string} bookingId - The ID of the booking to cancel.
   * @param {string} userRole - The role initiating the cancellation ('user', 'vendor', 'admin').
   * @param {Object} cancellationDetails - { reason, description }
   * @returns {Promise<Object>} The cancelled booking document.
   */
  async execute(bookingId, userRole, { reason, description }) {
    // 1. Fetch Booking with Customer User ID
    const booking = await Booking.findById(bookingId).populate('userId', '_id');
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // 2. Validate Cancellation Policy (Throws if invalid)
    CancellationPolicyEngine.validate(booking, userRole);

    // 3. Determine Refund Strategy & Amount
    const { refundableAmount, destination } = RefundEngine.calculate(booking);

    // 4. Financial Ledger (Wallet Credit)
    // We execute financial movement BEFORE database state changes 
    // to ensure we never drop a refund if the DB update fails.
    if (refundableAmount > 0 && destination === REFUND_DESTINATION.WALLET) {
      const customerUserId = booking.userId._id || booking.userId;
      
      const ledgerDescription = `Refund for cancelled booking: ${bookingId}`;
      
      try {
        // Attempt to credit wallet. This generates a WalletTransaction.
        await creditWallet(
          customerUserId, 
          refundableAmount, 
          ledgerDescription, 
          booking._id
        );
      } catch (error) {
        console.error('Refund Wallet Credit Failed:', error);
        throw new AppError('Failed to process wallet refund. Cancellation aborted.', 500);
      }
    } else if (refundableAmount > 0 && destination === REFUND_DESTINATION.RAZORPAY) {
      // Future expansion: process via Razorpay Refund API
      throw new AppError('Razorpay refunds are not supported in this version. Please contact support.', 501);
    }

    // 5. Update Booking State
    booking.bookingStatus = BOOKING_STATUS.CANCELLED;
    
    if (refundableAmount > 0) {
      booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
      booking.refundAmount = refundableAmount;
      booking.refundStatus = 'processed'; // Legacy field integration
    }
    
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: userRole,
      reason: reason,
      description: description
    };

    // Keep legacy root fields for backward compatibility if needed, 
    // but schema subdocument 'cancellation' is preferred.
    booking.cancellationReason = reason;
    booking.cancellationDescription = description;

    await booking.save();

    // 6. Liberate Availability Slots
    if (booking.slotIds && booking.slotIds.length > 0) {
      const validSlotObjectIds = booking.slotIds.filter(id => 
        id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id.toString())
      );
      if (validSlotObjectIds.length > 0) {
        await AvailabilityOverride.deleteMany(
          { _id: { $in: validSlotObjectIds } }
        ).catch(err => {
          console.error(`Failed to liberate slots for cancelled booking ${bookingId}:`, err);
          // Non-fatal error, but should be logged. The user got their refund.
        });
      }
    }

    // 7. Dispatch Notifications
    try {
      const customerUserId = booking.userId._id || booking.userId;
      const vendorUserId = booking.vendorId;

      const title = 'Booking Cancelled';
      const message = `Booking ${bookingId.toString().substring(0,8)} has been cancelled by ${userRole}.`;

      // Notify Vendor
      if (userRole !== 'vendor') {
        await notificationService.createNotification(vendorUserId, title, message, 'BOOKING', bookingId);
      }
      
      // Notify Customer
      if (userRole !== 'user') {
        const refundMsg = refundableAmount > 0 ? ` ₹${refundableAmount} has been refunded to your wallet.` : '';
        await notificationService.createNotification(customerUserId, title, message + refundMsg, 'BOOKING', bookingId);
      }
    } catch (notifyErr) {
      console.error('Failed to dispatch cancellation notifications:', notifyErr);
    }

    return booking;
  }
}

export default new BookingCancellationService();
