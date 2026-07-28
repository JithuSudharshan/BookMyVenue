import { REFUND_DESTINATION } from '../../utils/bookingConstants.js';

class RefundEngine {
  /**
   * Calculates the refundable amount and strategy for a cancelled booking.
   * Currently, standard policy is a 100% refund of whatever was paid (advance or total).
   * 
   * @param {Object} booking - The booking document.
   * @returns {Object} { refundableAmount, destination }
   */
  calculate(booking) {
    let refundableAmount = 0;

    // If payment is completely pending, nothing to refund.
    if (booking.paymentStatus === 'pending' && !booking.advanceAmount) {
      return { refundableAmount: 0, destination: null };
    }

    // Amount actually paid by the user is stored in advanceAmount (if partial) 
    // or totalAmount (if completed). 
    // In the current architecture, advanceAmount tracks the paid deposit if policy is 'advance_payment'.
    
    // For simplicity, we check if paymentStatus is partial or completed.
    if (['partial', 'completed'].includes(booking.paymentStatus)) {
      if (booking.pricing && booking.pricing.paymentPolicy === 'advance_payment') {
        // If they only paid advance, refund the advance amount
        refundableAmount = booking.pricing.advanceAmount;
      } else if (booking.pricing) {
        // If they paid full, refund full amount
        refundableAmount = booking.pricing.totalAmount;
      } else {
        // Legacy fallback
        refundableAmount = booking.advanceAmount || booking.totalAmount || 0;
      }
    }

    // Default to Wallet for MVP
    const destination = refundableAmount > 0 ? REFUND_DESTINATION.WALLET : null;

    return {
      refundableAmount,
      destination
    };
  }
}

export default new RefundEngine();
