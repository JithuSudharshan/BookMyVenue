import { BOOKING_STATUS } from '../../utils/bookingConstants.js';
import AppError from '../../utils/AppError.js';

class BookingStateMachine {
  /**
   * Validates if a booking can transition from its current state to a target state.
   * Throws an AppError if the transition is illegal.
   * 
   * @param {string} currentStatus - The current bookingStatus
   * @param {string} targetStatus - The intended bookingStatus
   */
  validateTransition(currentStatus, targetStatus) {
    if (targetStatus === BOOKING_STATUS.CANCELLED) {
      const allowedPreviousStates = [
        BOOKING_STATUS.PENDING,
        BOOKING_STATUS.CONFIRMED
      ];

      if (!allowedPreviousStates.includes(currentStatus)) {
        throw new AppError(
          `Illegal State Transition: Cannot cancel a booking that is currently '${currentStatus}'.`,
          400
        );
      }
    }
    
    // Future transitions (e.g., COMPLETED, RESCHEDULED) can be added here
    
    return true;
  }
}

export default new BookingStateMachine();
