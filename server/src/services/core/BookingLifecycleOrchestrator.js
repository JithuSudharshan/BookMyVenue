import Booking from '../../models/bookingModel.js';
import AvailabilityOverride from '../../models/availabilityOverrideModel.js';
import CancellationPolicyEngine from './CancellationPolicyEngine.js';
import RefundEngine from './RefundEngine.js';
import TransactionService from './TransactionService.js';
import AuditLogService from './AuditLogService.js';
import notificationService from '../notificationService.js';
import { 
  BOOKING_STATUS, 
  PAYMENT_STATUS, 
  REFUND_DESTINATION
} from '../../utils/bookingConstants.js';
import AppError from '../../utils/AppError.js';

class BookingLifecycleOrchestrator {
  
  /**
   * Orchestrates the cancellation of a booking safely across all domains.
   * Execution Order: Validation -> Strategy -> Transaction -> State Update -> Liberation -> Audit & Notification.
   * 
   * @param {string} bookingId - The ID of the booking to cancel.
   * @param {string} actorRole - The role initiating the cancellation ('user', 'vendor', 'admin').
   * @param {Object} cancellationDetails - { reason, description }
   * @returns {Promise<Object>} The cancelled booking document.
   */
  async cancelBooking(bookingId, actorRole, { reason, description }) {
    // 1. Fetch Booking
    const booking = await Booking.findById(bookingId).populate('userId', '_id');
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // 2. Validation
    CancellationPolicyEngine.validate(booking, actorRole);

    // 3. Refund Policy Calculation
    const { refundableAmount, destination } = RefundEngine.calculate(booking);

    let transaction = null;

    // 4. Financial Transaction (if applicable)
    // Execute BEFORE database state changes to prevent dropping refunds on DB failures.
    if (refundableAmount > 0) {
      if (destination === REFUND_DESTINATION.WALLET) {
        const customerUserId = booking.userId._id || booking.userId;
        const ledgerDescription = `Refund for cancelled booking: ${bookingId}`;
        
        transaction = await TransactionService.processWalletRefund(
          customerUserId, 
          refundableAmount, 
          booking._id,
          ledgerDescription
        );
      } else {
        throw new AppError('Only wallet refunds are supported in the MVP phase.', 501);
      }
    }

    // 5. Booking State Update
    booking.bookingStatus = BOOKING_STATUS.CANCELLED;
    
    if (refundableAmount > 0) {
      booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
      booking.refundAmount = refundableAmount;
      booking.refundStatus = 'processed';
    }
    
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: actorRole,
      reason: reason,
      description: description
    };
    
    // Legacy support
    booking.cancellationReason = reason;
    booking.cancellationDescription = description;

    await booking.save();

    // 6. Availability Release
    if (booking.slotIds && booking.slotIds.length > 0) {
      const validSlotObjectIds = booking.slotIds.filter(id => 
        id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id.toString())
      );
      if (validSlotObjectIds.length > 0) {
        await AvailabilityOverride.deleteMany(
          { _id: { $in: validSlotObjectIds } }
        ).catch(err => {
          console.error(`[Non-Fatal] Failed to liberate slots for cancelled booking ${bookingId}:`, err);
        });
      }
    }

    // 7. Audit Log
    AuditLogService.logTransition('BOOKING', booking._id, 'CANCELLED', actorRole, {
      reason,
      refundableAmount,
      transactionId: transaction ? transaction._id : null
    });

    // 8. Notifications
    try {
      const customerUserId = booking.userId._id || booking.userId;
      const vendorUserId = booking.vendorId;

      const title = 'Booking Cancelled';
      const message = `Booking ${bookingId.toString().substring(0,8)} has been cancelled by ${actorRole}.`;

      if (actorRole !== 'vendor') {
        await notificationService.createNotification(vendorUserId, title, message, 'BOOKING', bookingId);
      }
      
      if (actorRole !== 'user') {
        const refundMsg = refundableAmount > 0 ? ` ₹${refundableAmount} has been refunded to your wallet.` : '';
        await notificationService.createNotification(customerUserId, title, message + refundMsg, 'BOOKING', bookingId);
      }
    } catch (notifyErr) {
      console.error('[Non-Fatal] Failed to dispatch cancellation notifications:', notifyErr);
    }

    return booking;
  }
}

export default new BookingLifecycleOrchestrator();
