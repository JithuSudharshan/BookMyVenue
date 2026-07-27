import BookingSession from '../../models/bookingSessionModel.js';
import AvailabilityOverride from '../../models/availabilityOverrideModel.js';
import AppError from '../../utils/AppError.js';
import { validateHourlySlots, validateDailyRange } from './AvailabilityValidatorService.js';
import { calculateHourlyPrice, calculateDailyPrice } from './PricingEngineService.js';
import { determinePaymentPolicy } from './PaymentPolicyEngine.js';
import mongoose from 'mongoose';

export const createReservation = async (userId, venueId, bookingData) => {
  const { bookingMode, date, fromTime, toTime, startDate, endDate, guestCount } = bookingData;
  
  let venue, pricing;

  // 1. Validation, Pricing, & Policy
  if (bookingMode === 'hourly') {
    const valResult = await validateHourlySlots(venueId, date, fromTime, toTime);
    venue = valResult.venue;
    const basePricing = calculateHourlyPrice(venue, fromTime, toTime, guestCount);
    const policy = determinePaymentPolicy('hourly', date, basePricing.totalAmount);
    pricing = { ...basePricing, ...policy };
  } else if (bookingMode === 'daily') {
    const valResult = await validateDailyRange(venueId, startDate, endDate);
    venue = valResult.venue;
    const basePricing = calculateDailyPrice(venue, startDate, endDate, guestCount);
    const policy = determinePaymentPolicy('daily', startDate, basePricing.totalAmount);
    pricing = { ...basePricing, ...policy };
  } else {
    throw new AppError('Invalid booking mode', 400);
  }

  // 2. Create Session (Atomic creation due to unique compound index)
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
  const session = await BookingSession.findOne({ sessionId, status: 'active' }).populate('venueId', 'name location price');
  if (!session) {
    throw new AppError('Reservation session expired or not found', 404);
  }
  // If it's technically expired but TTL hasn't reaped it yet
  if (new Date() > session.expiresAt) {
    session.status = 'expired';
    await session.save();
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
export const confirmReservation = async (sessionId) => {
  const session = await BookingSession.findOne({ sessionId });
  if (!session) throw new AppError('Session not found', 404);
  if (session.status === 'confirmed') return session; // Idempotent

  session.status = 'confirmed';
  await session.save();

  // Create AvailabilityOverride to permanently block the slot
  if (session.bookingMode === 'hourly') {
    await AvailabilityOverride.findOneAndUpdate(
      { venueId: session.venueId, date: session.date },
      {
        $push: {
          blocks: {
            fromTime: session.fromTime,
            toTime: session.toTime,
            reason: 'Customer Booking',
            // bookingId will be updated later when Booking is created, or passed here if available
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
        { venueId: session.venueId, date: d },
        {
          isFullDayBlocked: true,
          fullDayReason: 'Customer Booking'
        },
        { upsert: true, new: true }
      );
    }
  }

  return session;
};
