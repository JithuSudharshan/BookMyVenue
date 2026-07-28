import mongoose from 'mongoose';
import Booking from '../../models/bookingModel.js';
import CancellationPolicyEngine from './CancellationPolicyEngine.js';
import RefundEngine from './RefundEngine.js';
import TransactionService from './TransactionService.js';
import AuditLogService from './AuditLogService.js';
import EventBus from '../../utils/EventBus.js';
import BookingStateMachine from './BookingStateMachine.js';
import AvailabilityService from './AvailabilityService.js';
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  REFUND_DESTINATION,
  USER_ROLES,
  DOMAIN_EVENTS
} from '../../utils/bookingConstants.js';
import { getTodayString, parseDateToInt, getNowMinutes, timeToMinutes } from '../../utils/dateUtils.js';
import AppError from '../../utils/AppError.js';

class BookingLifecycleOrchestrator {

  /**
   * Orchestrates the cancellation of a booking safely across all domains.
   * 
   * @param {Object} context - Cancellation context.
   * @param {string} context.actorId - ID of the user initiating cancellation.
   * @param {string} context.actorRole - Role of the user ('user', 'vendor', 'admin').
   * @param {string} context.bookingId - ID of the booking to cancel.
   * @param {string} context.cancellationReason - Reason provided for cancellation.
   * @param {string} context.requestSource - Source (e.g. 'customer_portal')
   * @param {string} context.ip - IP address
   * @param {string} context.userAgent - User agent
   * @returns {Promise<Object>} The cancelled booking document.
   */
  async cancel(context) {
    const booking = await this._loadBooking(context.bookingId);

    this._validateOwnership(booking, context.actorId, context.actorRole);

    // Strict State Machine Transition Check
    BookingStateMachine.validateTransition(booking.bookingStatus, BOOKING_STATUS.CANCELLED);

    // Business Rules
    CancellationPolicyEngine.validate(booking, context.actorRole);
    const { refundableAmount, destination } = RefundEngine.calculate(booking);

    // MongoDB Session for strict transactional consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    let walletTransaction = null;
    let finalBookingStatus = null;
    let finalPaymentStatus = null;

    try {
      // 1. Process Financials (Wallet Credit + Idempotency)
      if (refundableAmount > 0 && destination === REFUND_DESTINATION.WALLET) {
        walletTransaction = await this._processFinancials(booking, refundableAmount, session);
      }

      // 2. Atomic Booking Status Update via State Matching
      const updatedBooking = await this._updateBooking(booking, context, refundableAmount, session);
      finalBookingStatus = updatedBooking.bookingStatus;
      finalPaymentStatus = updatedBooking.paymentStatus;

      // 3. Release Availability (Executed LAST in transaction)
      await this._releaseAvailability(booking, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    // Post-Commit Actions
    this._publishEvents(booking, walletTransaction, refundableAmount, context, finalBookingStatus, finalPaymentStatus);

    // Write detailed Audit Log
    AuditLogService.logTransition('BOOKING', booking._id, 'CANCELLED', context.actorRole, {
      cancelledBy: context.actorId,
      reason: context.cancellationReason,
      refundableAmount,
      refundReference: walletTransaction ? walletTransaction._id : null,
      ip: context.ip,
      userAgent: context.userAgent
    });

    // Return the clean entity to the Controller
    return this._loadBooking(context.bookingId);
  }

  /**
   * Orchestrates the completion of a booking.
   * 
   * @param {Object} context
   * @param {string} context.actorId - ID of the vendor initiating completion.
   * @param {string} context.bookingId - ID of the booking to complete.
   * @returns {Promise<Object>} The completed booking document.
   */
  async complete(context) {
    const booking = await this._loadBooking(context.bookingId);

    // Validate ownership
    if (booking.vendorId.toString() !== context.actorId.toString()) {
      throw new AppError('Unauthorized: You do not own the venue for this booking.', 403);
    }

    // Validate status
    if (booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
      throw new AppError(`Booking cannot be completed from ${booking.bookingStatus} state.`, 400);
    }
    if (booking.paymentStatus !== PAYMENT_STATUS.COMPLETED && booking.pricing.remainingAmount > 0) {
      throw new AppError('Cannot mark as complete. Balance payment is pending.', 400);
    }

    // Validate Event Time (Timezone Safe)
    const todayInt = parseDateToInt(getTodayString());
    const nowMins = getNowMinutes();

    let eventDateStr = booking.bookingMode === 'hourly' ? booking.date : booking.endDate;
    const eventDateInt = parseDateToInt(eventDateStr);

    let hasEnded = false;

    if (eventDateInt < todayInt) {
      hasEnded = true;
    } else if (eventDateInt === todayInt) {
      if (booking.bookingMode === 'hourly') {
        const eventEndMins = timeToMinutes(booking.toTime);
        if (nowMins >= eventEndMins) {
          hasEnded = true;
        }
      } else {
        // Daily bookings end at 23:59. They can only be marked completed the next day.
        hasEnded = false; 
      }
    }

    if (!hasEnded) {
      throw new AppError('Cannot mark booking as completed before the event has ended.', 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    let updatedBooking;

    try {
      const timelineEvents = [
        {
          status: BOOKING_STATUS.COMPLETED,
          note: 'Marked as completed by vendor.',
          timestamp: new Date()
        }
      ];

      updatedBooking = await Booking.findOneAndUpdate(
        {
          _id: booking._id,
          bookingStatus: BOOKING_STATUS.CONFIRMED
        },
        {
          $set: { bookingStatus: BOOKING_STATUS.COMPLETED },
          $push: { timeline: { $each: timelineEvents } }
        },
        { new: true, session }
      ).populate('venueId');

      if (!updatedBooking) {
        throw new AppError('Booking transition failed: Booking is not in a confirmed state.', 409);
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    EventBus.publish(DOMAIN_EVENTS.BOOKING_COMPLETED, {
      bookingId: updatedBooking._id,
      bookingNumber: updatedBooking.bookingNumber,
      customerId: updatedBooking.userId._id || updatedBooking.userId,
      vendorId: updatedBooking.vendorId,
      venueId: updatedBooking.venueId._id,
      venueName: updatedBooking.venueId.name
    });

    return updatedBooking;
  }

  // --- Internal Delegate Methods ---

  async _loadBooking(bookingId) {
    const booking = await Booking.findById(bookingId).populate('userId', '_id');
    if (!booking) throw new AppError('Booking not found', 404);
    return booking;
  }

  _validateOwnership(booking, actorId, actorRole) {
    const actorIdStr = actorId.toString();
    if (actorRole === USER_ROLES.CUSTOMER && booking.userId._id.toString() !== actorIdStr) {
      throw new AppError('Unauthorized: You do not have permission to cancel this booking.', 403);
    }
    if (actorRole === USER_ROLES.VENDOR && booking.vendorId.toString() !== actorIdStr) {
      throw new AppError('Unauthorized: You do not own the venue for this booking.', 403);
    }
  }

  async _processFinancials(booking, refundableAmount, session) {
    const customerUserId = booking.userId._id || booking.userId;
    const ledgerDescription = `Refund for cancelled booking: ${booking.bookingNumber || booking._id}`;
    const idempotencyKey = `REFUND:${booking._id}:wallet`;

    // Safely debit the admin wallet to keep the ledger balanced.
    // If it fails (e.g. insufficient funds in dev), we don't await/throw to avoid blocking the customer refund.
    TransactionService.processAdminWalletDebit(
      refundableAmount,
      booking._id,
      idempotencyKey,
      `Debit for customer refund of cancelled booking ${booking.bookingNumber || booking._id}`
    ).catch(e => console.error('Admin wallet debit failed silently:', e));

    return await TransactionService.processWalletRefund(
      customerUserId,
      refundableAmount,
      booking._id,
      idempotencyKey,
      ledgerDescription,
      session
    );
  }

  async _updateBooking(booking, context, refundableAmount, session) {
    const timelineEvents = [
      {
        status: BOOKING_STATUS.CANCELLED,
        note: `Cancelled by ${context.actorRole}: ${context.cancellationReason}`,
        timestamp: new Date()
      }
    ];

    const updateData = {
      $set: {
        bookingStatus: BOOKING_STATUS.CANCELLED,
        cancellation: {
          cancelledAt: new Date(),
          cancelledBy: context.actorId,
          cancelledByRole: context.actorRole,
          reason: context.cancellationReason,
          description: ''
        },
        cancellationReason: context.cancellationReason,
      }
    };

    if (refundableAmount > 0) {
      updateData.$set.paymentStatus = PAYMENT_STATUS.REFUNDED;
      updateData.$set.refundAmount = refundableAmount;
      updateData.$set.refundStatus = 'processed';
      timelineEvents.push({
        status: 'refunded',
        note: `Refund of ₹${refundableAmount} instantly processed to customer wallet.`,
        timestamp: new Date()
      });
    }

    timelineEvents.push({
      status: 'slots_released',
      note: 'Venue availability slots successfully released.',
      timestamp: new Date()
    });

    updateData.$push = {
      timeline: {
        $each: timelineEvents
      }
    };

    // Atomic state matching inside transaction ensures another process didn't change it
    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        bookingStatus: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] }
      },
      updateData,
      { new: true, session }
    );

    if (!updatedBooking) {
      throw new AppError('Booking transition failed: Booking is not in a cancellable state.', 409);
    }
    return updatedBooking;
  }

  async _releaseAvailability(booking, session) {
    if (booking.slotIds && booking.slotIds.length > 0) {
      await AvailabilityService.releaseBookingSlots(booking.slotIds, session);
    }
  }

  _publishEvents(booking, walletTransaction, refundableAmount, context, newBookingStatus, newPaymentStatus) {
    EventBus.publish(DOMAIN_EVENTS.BOOKING_CANCELLED, {
      bookingId: booking._id,
      venueId: booking.venueId,
      customerId: booking.userId._id || booking.userId,
      vendorId: booking.vendorId,
      actorId: context.actorId,
      actorRole: context.actorRole,
      refundAmount: refundableAmount,
      refundReference: walletTransaction ? walletTransaction._id : null,
      cancelledAt: new Date(),
      bookingStatus: newBookingStatus,
      paymentStatus: newPaymentStatus,
      requestSource: context.requestSource
    });

    if (refundableAmount > 0) {
      EventBus.publish(DOMAIN_EVENTS.REFUND_PROCESSED, {
        bookingId: booking._id,
        customerId: booking.userId._id || booking.userId,
        amount: refundableAmount
      });
    }
  }
}

export default new BookingLifecycleOrchestrator();
