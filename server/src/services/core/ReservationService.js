import BookingSession from '../../models/bookingSessionModel.js';
import Booking from '../../models/bookingModel.js';
import Venue from '../../models/venueModel.js';
import AvailabilityOverride from '../../models/availabilityOverrideModel.js';
import AppError from '../../utils/AppError.js';
import { generateBookingNumber } from '../../utils/bookingUtils.js';
import { validateHourlySlots, validateDailyRange } from './AvailabilityValidatorService.js';
import { calculateHourlyPrice, calculateDailyPrice } from './PricingEngineService.js';
import { determinePaymentPolicy } from './PaymentPolicyEngine.js';
import mongoose from 'mongoose';
import EventBus from '../../utils/EventBus.js';
import { DOMAIN_EVENTS } from '../../utils/bookingConstants.js';
export const createReservation = async (userId, venueId, bookingData) => {
  const { bookingMode, date, fromTime, toTime, startDate, endDate, guestCount } = bookingData;
  
  let venue, pricing;

  // 1. Validation, Pricing, & Policy
  if (bookingMode === 'hourly') {
    const valResult = await validateHourlySlots(venueId, date, fromTime, toTime, guestCount);
    venue = valResult.venue;
    const basePricing = calculateHourlyPrice(venue, fromTime, toTime, guestCount);
    const policy = determinePaymentPolicy('hourly', date, basePricing.totalAmount);
    pricing = { ...basePricing, ...policy };
  } else if (bookingMode === 'daily') {
    const valResult = await validateDailyRange(venueId, startDate, endDate, guestCount);
    venue = valResult.venue;
    const basePricing = calculateDailyPrice(venue, startDate, endDate, guestCount);
    const policy = determinePaymentPolicy('daily', startDate, basePricing.totalAmount);
    pricing = { ...basePricing, ...policy };
  } else {
    throw new AppError('Invalid booking mode', 400);
  }

  // 2. Overlap Protection (Pre-validate before save)
  if (bookingMode === 'hourly') {
    const overlappingSession = await BookingSession.findOne({
      venueId,
      date,
      bookingMode: 'hourly',
      status: 'active',
      fromTime: { $lt: toTime },
      toTime: { $gt: fromTime }
    });
    if (overlappingSession) {
      throw new AppError('This slot is currently reserved by someone else. Please try again later or choose another slot.', 409);
    }
  } else if (bookingMode === 'daily') {
    const overlappingSession = await BookingSession.findOne({
      venueId,
      bookingMode: 'daily',
      status: 'active',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });
    if (overlappingSession) {
      throw new AppError('These dates are currently reserved by someone else. Please try again later or choose other dates.', 409);
    }
  }

  // 3. Create Session (Atomic creation due to unique compound index)
  // TTL is 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

  try {
    const session = new BookingSession({
      userId,
      venueId,
      bookingMode,
      date,
      fromTime,
      toTime,
      startDate,
      endDate,
      guestCount,
      pricing,
      expiresAt,
      status: 'active'
    });

    await session.save();
    return session;

  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('This slot is currently reserved by someone else. Please try again later or choose another slot.', 409);
    }
    throw error;
  }
};

export const getActiveSession = async (sessionId) => {
  const session = await BookingSession.findOne({ sessionId }).populate('venueId', 'name location price images');
  if (!session) {
    throw new AppError('Reservation session not found', 404);
  }
  if (session.status === 'confirmed') {
    throw new AppError('ALREADY_CONFIRMED', 400);
  }
  if (session.status !== 'active') {
    throw new AppError(`Reservation session is ${session.status}`, 400);
  }
  // If it's technically expired but TTL hasn't reaped it yet
  if (new Date() > session.expiresAt) {
    session.status = 'expired';
    await session.save();

    EventBus.publish(DOMAIN_EVENTS.BOOKING_EXPIRED, {
      bookingId: session.sessionId,
      customerId: session.userId,
      bookingNumber: session.sessionId.substring(0,8).toUpperCase(),
      venueId: session.venueId._id || session.venueId,
      venueName: session.venueId.name || 'Venue'
    });

    throw new AppError('Reservation session expired', 404);
  }
  return session;
};

export const releaseReservation = async (sessionId) => {
  const session = await BookingSession.findOneAndUpdate(
    { sessionId, status: 'active' },
    { status: 'released' },
    { new: true }
  );
  return session;
};

// Confirm is called after payment success
export const confirmReservation = async (sessionId, paymentDetails = {}) => {
  const session = await BookingSession.findOne({ sessionId }).populate('venueId');
  if (!session) throw new AppError('Session not found', 404);
  
  if (session.status === 'confirmed') return session; // Idempotent: already processed

  if (session.status !== 'active') {
    throw new AppError(`Cannot confirm reservation. Session status is ${session.status}`, 400);
  }

  // Generate Booking Number
  const bookingNumber = generateBookingNumber();

  // Create Booking Document
  const booking = new Booking({
    bookingNumber,
    sessionId: session.sessionId,
    userId: session.userId,
    venueId: session.venueId._id,
    vendorId: session.venueId.vendorId, // Assuming venue has vendorId
    bookingMode: session.bookingMode,
    
    date: session.date,
    fromTime: session.fromTime,
    toTime: session.toTime,
    
    startDate: session.startDate,
    endDate: session.endDate,
    
    guestCount: session.guestCount,
    pricing: session.pricing,
    
    payment: {
      method: paymentDetails.method || 'razorpay',
      walletAmount: session.walletDeductedAmt || 0,
      razorpayAmount: session.pricing.razorpayAmount || 0,
      razorpayOrderId: paymentDetails.razorpayOrderId || session.razorpayOrderId,
      razorpayPaymentId: paymentDetails.razorpayPaymentId,
      razorpaySignature: paymentDetails.razorpaySignature,
      paidAt: new Date()
    },
    
    bookingStatus: 'confirmed',
    paymentStatus: 'completed', // Or partial if advance payment
    timeline: [
      { status: 'confirmed', note: 'Booking confirmed and payment successful' }
    ]
  });

  if (session.pricing.paymentPolicy === 'advance_payment') {
    booking.paymentStatus = 'partial';
  }

  await booking.save();

  // Update Session
  session.status = 'confirmed';
  session.paymentStatus = 'completed';
  session.razorpayPaymentId = paymentDetails.razorpayPaymentId;
  await session.save();

  // Create AvailabilityOverride to permanently block the slot
  if (session.bookingMode === 'hourly') {
    await AvailabilityOverride.findOneAndUpdate(
      { venueId: session.venueId._id, date: session.date },
      {
        $push: {
          blocks: {
            fromTime: session.fromTime,
            toTime: session.toTime,
            reason: 'Customer Booking',
            bookingId: booking._id
          }
        }
      },
      { upsert: true, new: true }
    );
  } else {
    // Daily: create full day blocks for the range
    const dates = [];
    let curr = new Date(session.startDate);
    const end = new Date(session.endDate);
    while (curr <= end) {
      dates.push(`${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`);
      curr.setDate(curr.getDate() + 1);
    }
    
    for (const d of dates) {
      await AvailabilityOverride.findOneAndUpdate(
        { venueId: session.venueId._id, date: d },
        {
          isFullDayBlocked: true,
          fullDayReason: 'Customer Booking'
        },
        { upsert: true, new: true }
      );
    }
  }

  // Publish Domain Events for Notifications
  EventBus.publish(DOMAIN_EVENTS.BOOKING_CONFIRMED, {
    bookingId: booking._id,
    customerId: booking.userId,
    vendorId: booking.vendorId,
    venueId: session.venueId._id,
    venueName: session.venueId.name,
    bookingNumber: booking.bookingNumber
  });

  return booking;
};
