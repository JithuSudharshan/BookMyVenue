import AppError from '../../utils/AppError.js';
import { BOOKING_STATUS } from '../../utils/bookingConstants.js';
import { getTodayString, timeToMinutes, getNowMinutes } from '../../utils/dateUtils.js';

class CancellationPolicyEngine {
  /**
   * Validates whether a booking can be cancelled.
   * @param {Object} booking - The booking document.
   * @param {String} userRole - The role of the user requesting cancellation ('customer', 'vendor', 'admin').
   * @returns {Boolean} true if valid
   * @throws {AppError} if cancellation is invalid
   */
  validate(booking, userRole) {
    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }

    // 1. Idempotency & Terminal State Check
    if ([BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.REFUNDED, BOOKING_STATUS.REFUND_PENDING].includes(booking.bookingStatus)) {
      throw new AppError(`Booking cannot be cancelled. Current status is ${booking.bookingStatus}.`, 400);
    }

    // 2. Allow cancellation for pending or confirmed bookings
    if (![BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.bookingStatus)) {
      throw new AppError(`Invalid booking status for cancellation: ${booking.bookingStatus}.`, 400);
    }

    // 3. Time-based Policy (Cannot cancel a past booking)
    const todayStr = getTodayString();
    const bookingDateStr = booking.date || booking.startDate; // Handle both hourly and daily

    if (bookingDateStr < todayStr) {
      throw new AppError('Cannot cancel a booking that has already passed.', 400);
    }

    if (bookingDateStr === todayStr && booking.bookingMode === 'hourly') {
      const nowMin = getNowMinutes();
      const startMin = timeToMinutes(booking.fromTime);
      
      // Prevent cancellation if the booking starts in less than 60 minutes
      // (This could be configurable per venue in the future)
      if (startMin - nowMin < 60) {
        throw new AppError('Cannot cancel a booking within 60 minutes of the start time.', 400);
      }
    }

    // 4. Role specific checks (Future expansion)
    // E.g., Vendors can always cancel, but maybe Customers have stricter windows.

    return true;
  }
}

export default new CancellationPolicyEngine();
