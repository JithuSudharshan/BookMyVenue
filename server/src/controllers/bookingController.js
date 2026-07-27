import * as ReservationService from '../services/core/ReservationService.js';
import * as AvailabilityValidatorService from '../services/core/AvailabilityValidatorService.js';
import * as PricingEngineService from '../services/core/PricingEngineService.js';
import { determinePaymentPolicy } from '../services/core/PaymentPolicyEngine.js';
import { buildBookingSummary } from '../services/core/BookingSummaryBuilder.js';
import catchAsync from '../utils/catchAsync.js';

export const getPricingSummary = catchAsync(async (req, res) => {
  const { venueId, bookingMode, date, fromTime, toTime, startDate, endDate, guestCount } = req.body;

  let validationResult;
  let pricingData;
  let policyData;

  // 1. Availability Validation & Pricing
  if (bookingMode === 'hourly') {
    if (!date || !fromTime || !toTime) {
      return res.status(400).json({ status: 'fail', message: 'Missing date or time for hourly booking' });
    }
    validationResult = await AvailabilityValidatorService.validateHourlySlots(venueId, date, fromTime, toTime);
    pricingData = PricingEngineService.calculateHourlyPrice(validationResult.venue, fromTime, toTime, guestCount);
    policyData = determinePaymentPolicy('hourly', date, pricingData.totalAmount);
  } else if (bookingMode === 'daily') {
    if (!startDate || !endDate) {
      return res.status(400).json({ status: 'fail', message: 'Missing dates for daily booking' });
    }
    validationResult = await AvailabilityValidatorService.validateDailyRange(venueId, startDate, endDate);
    pricingData = PricingEngineService.calculateDailyPrice(validationResult.venue, startDate, endDate, guestCount);
    policyData = determinePaymentPolicy('daily', startDate, pricingData.totalAmount);
  } else {
    return res.status(400).json({ status: 'fail', message: 'Invalid booking mode' });
  }

  // 2. Booking Summary Builder
  const summary = buildBookingSummary(pricingData, policyData);

  res.status(200).json({
    success: true,
    data: summary
  });
});

export const createSession = catchAsync(async (req, res) => {
  const { venueId, bookingMode, date, fromTime, toTime, startDate, endDate, guestCount } = req.body;
  const userId = req.user._id;

  const session = await ReservationService.createReservation(userId, venueId, {
    bookingMode, date, fromTime, toTime, startDate, endDate, guestCount
  });

  res.status(201).json({
    success: true,
    data: {
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
      pricing: session.pricing,
    }
  });
});

export const getSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const session = await ReservationService.getActiveSession(sessionId);

  // Ensure the user requesting is the one who created it
  if (session.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ status: 'fail', message: 'Unauthorized access to this session' });
  }

  const remainingSeconds = Math.max(0, Math.floor((new Date(session.expiresAt) - new Date()) / 1000));

  res.status(200).json({
    success: true,
    data: {
      session,
      remainingSeconds
    }
  });
});

export const releaseSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  await ReservationService.releaseReservation(sessionId);
  
  res.status(200).json({
    success: true,
    message: 'Reservation released successfully'
  });
});
