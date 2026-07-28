import * as ReservationService from '../services/core/ReservationService.js';
import * as AvailabilityValidatorService from '../services/core/AvailabilityValidatorService.js';
import * as PricingEngineService from '../services/core/PricingEngineService.js';
import { determinePaymentPolicy } from '../services/core/PaymentPolicyEngine.js';
import { buildBookingSummary } from '../services/core/BookingSummaryBuilder.js';
import PaymentService from '../services/core/PaymentService.js';
import catchAsync from '../utils/catchAsync.js';
import EventBus from '../utils/EventBus.js';
import { DOMAIN_EVENTS } from '../utils/bookingConstants.js';
import BookingSession from '../models/bookingSessionModel.js';
import Booking from '../models/bookingModel.js';
import { getRazorpayInstance } from '../config/razorpay.js';

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
    validationResult = await AvailabilityValidatorService.validateHourlySlots(venueId, date, fromTime, toTime, guestCount);
    pricingData = PricingEngineService.calculateHourlyPrice(validationResult.venue, fromTime, toTime, guestCount);
    policyData = determinePaymentPolicy('hourly', date, pricingData.totalAmount);
  } else if (bookingMode === 'daily') {
    if (!startDate || !endDate) {
      return res.status(400).json({ status: 'fail', message: 'Missing dates for daily booking' });
    }
    validationResult = await AvailabilityValidatorService.validateDailyRange(venueId, startDate, endDate, guestCount);
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

export const getSession = async (req, res, next) => {
  try {
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
  } catch (error) {
    if (error.message === 'ALREADY_CONFIRMED') {
      return res.status(200).json({ success: true, alreadyConfirmed: true });
    }
    next(error);
  }
};

export const releaseSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  await ReservationService.releaseReservation(sessionId);
  
  res.status(200).json({
    success: true,
    message: 'Reservation released successfully'
  });
});

export const createPaymentOrder = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    
    const session = await ReservationService.getActiveSession(sessionId);

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Unauthorized access to this session' });
    }

    const orderDetails = await PaymentService.createRazorpayOrder(session);

    res.status(200).json({
      success: true,
      data: orderDetails
    });
  } catch (error) {
    if (error.message === 'ALREADY_CONFIRMED') {
      return res.status(200).json({ success: true, alreadyConfirmed: true });
    }
    next(error);
  }
};

export const verifyPayment = catchAsync(async (req, res) => {
  const { sessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!sessionId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ status: 'fail', message: 'Missing payment verification details' });
  }

  // 1. Authenticate Signature via PaymentService
  const isValid = PaymentService.verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    try {
      const session = await BookingSession.findOne({ sessionId }).populate('venueId');
      if (session) {
        EventBus.publish(DOMAIN_EVENTS.PAYMENT_FAILED, {
          bookingId: session.sessionId,
          customerId: session.userId,
          bookingNumber: session.sessionId.substring(0,8).toUpperCase(),
          venueId: session.venueId._id || session.venueId,
          venueName: session.venueId.name || 'Venue'
        });
      }
    } catch(err) {
      console.error('Failed to publish PAYMENT_FAILED event:', err);
    }
    return res.status(400).json({ status: 'fail', message: 'Invalid payment signature' });
  }

  // 2. Delegate to ReservationService for idempotency and booking creation
  const paymentDetails = {
    method: 'razorpay',
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  };

  const booking = await ReservationService.confirmReservation(sessionId, paymentDetails);

  res.status(200).json({
    success: true,
    message: 'Payment verified and booking confirmed successfully',
    data: {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber
    }
  });
});

export const payBalance = catchAsync(async (req, res) => {
  const { id } = req.params;
  const customerUserId = req.user._id;

  const booking = await Booking.findOne({ _id: id, userId: customerUserId });
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (booking.paymentStatus !== 'partial' || booking.pricing.remainingAmount <= 0) {
    return res.status(400).json({ success: false, message: 'No balance payment is due for this booking' });
  }

  // Create Razorpay Order directly for the remaining amount
  const razorpay = getRazorpayInstance();
  const orderDetails = await razorpay.orders.create({
    amount: Math.round(booking.pricing.remainingAmount * 100),
    currency: 'INR',
    receipt: `bal_${booking.bookingNumber}`,
    notes: {
      bookingId: booking._id.toString(),
      type: 'balance_payment'
    }
  });

  res.status(200).json({
    success: true,
    data: {
      razorpayOrderId: orderDetails.id,
      amount: orderDetails.amount,
      currency: orderDetails.currency,
      key: process.env.RAZORPAY_KEY_ID
    }
  });
});

export const verifyBalance = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const customerUserId = req.user._id;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Missing payment verification details' });
  }

  const booking = await Booking.findOne({ _id: id, userId: customerUserId }).populate('venueId');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const isValid = PaymentService.verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }

  // Atomic update to prevent race conditions and duplicate payments
  const amountPaid = booking.pricing.remainingAmount;
  
  const updatedBooking = await Booking.findOneAndUpdate(
    {
      _id: id,
      userId: customerUserId,
      'pricing.remainingAmount': { $gt: 0 },
      paymentStatus: 'partial'
    },
    {
      $inc: { 'pricing.advanceAmount': amountPaid },
      $set: { 
        'pricing.remainingAmount': 0,
        paymentStatus: 'completed'
      },
      $push: {
        timeline: {
          status: 'balance_paid',
          note: 'Customer paid the remaining balance via Razorpay.',
          timestamp: new Date()
        }
      }
    },
    { new: true }
  ).populate('venueId');

  if (!updatedBooking) {
    return res.status(400).json({ success: false, message: 'Balance payment already processed or invalid state.' });
  }

  EventBus.publish(DOMAIN_EVENTS.BALANCE_PAID, {
    bookingId: updatedBooking._id,
    vendorId: updatedBooking.vendorId,
    bookingNumber: updatedBooking.bookingNumber,
    venueId: updatedBooking.venueId._id,
    venueName: updatedBooking.venueId.name,
    amountPaid
  });

  res.status(200).json({
    success: true,
    message: 'Balance payment verified successfully'
  });
});
