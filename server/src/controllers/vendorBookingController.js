import catchAsync from '../utils/catchAsync.js';
import * as vendorBookingService from '../services/core/vendorBookingService.js';
import bookingLifecycleOrchestrator from '../services/core/BookingLifecycleOrchestrator.js';
import { USER_ROLES, DOMAIN_EVENTS } from '../utils/bookingConstants.js';
import EventBus from '../utils/EventBus.js';
import Booking from '../models/bookingModel.js';
import User from '../models/userModel.js';
import { toVendorBookingDTO } from '../dto/booking/VendorBookingDTO.js';

/**
 * GET /api/vendor/bookings
 * Returns paginated bookings for the authenticated vendor.
 */
export const getVendorBookings = catchAsync(async (req, res) => {
  const vendorUserId = req.user._id;
  const { page, limit, status, venueId, bookingMode, search } = req.query;

  const data = await vendorBookingService.getVendorBookings(vendorUserId, {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
    status,
    venueId,
    bookingMode,
    search,
  });

  res.status(200).json({ success: true, ...data });
});

/**
 * GET /api/vendor/bookings/stats
 * Returns KPI stats for the vendor booking dashboard.
 */
export const getVendorBookingStats = catchAsync(async (req, res) => {
  const vendorUserId = req.user._id;
  const stats = await vendorBookingService.getVendorBookingStats(vendorUserId);
  res.status(200).json({ success: true, data: stats });
});

/**
 * GET /api/vendor/bookings/venues
 * Returns slim list of vendor's approved venues (for filter dropdown).
 */
export const getVendorVenueList = catchAsync(async (req, res) => {
  const vendorUserId = req.user._id;
  const venues = await vendorBookingService.getVendorVenueList(vendorUserId);
  res.status(200).json({ success: true, data: venues });
});

/**
 * POST /api/vendor/bookings/:id/cancel
 * Cancels a booking as a vendor.
 */
export const cancelVendorBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason, description } = req.body;
  const vendorUserId = req.user._id;

  const context = {
    bookingId: id,
    actorId: vendorUserId,
    actorRole: USER_ROLES.VENDOR,
    cancellationReason: reason || 'Vendor requested cancellation',
    description: description || '',
    requestSource: 'vendor_portal',
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'] || 'Unknown'
  };
  
  const cancelledBooking = await bookingLifecycleOrchestrator.cancel(context);
  
  // Populate for DTO mapping
  const populatedBooking = await Booking.findById(cancelledBooking._id).populate('venueId').lean();
  const customerUserId = populatedBooking.userId._id || populatedBooking.userId;
  const customerProfile = await User.findById(customerUserId).lean();

  const dto = toVendorBookingDTO(populatedBooking, customerProfile);
  
  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: dto
  });
});

/**
 * POST /api/vendor/bookings/:id/request-balance
 * Emits a socket notification to the customer to pay the remaining balance.
 */
export const requestBalance = catchAsync(async (req, res) => {
  const { id } = req.params;
  const vendorUserId = req.user._id;

  const booking = await Booking.findOne({ _id: id, vendorId: vendorUserId }).populate('venueId');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (booking.paymentStatus !== 'partial' || booking.pricing.remainingAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Balance payment is not applicable for this booking' });
  }

  EventBus.publish(DOMAIN_EVENTS.BALANCE_REQUESTED, {
    bookingId: booking._id,
    customerId: booking.userId,
    bookingNumber: booking.bookingNumber,
    venueId: booking.venueId._id,
    venueName: booking.venueId.name,
    balanceAmount: booking.pricing.remainingAmount
  });

  res.status(200).json({ success: true, message: 'Balance payment requested successfully.' });
});

/**
 * PATCH /api/vendor/bookings/:id/complete
 * Marks a fully-paid booking as completed.
 */
export const markAsCompleted = catchAsync(async (req, res) => {
  const { id } = req.params;
  const vendorUserId = req.user._id;

  const completedBooking = await bookingLifecycleOrchestrator.complete({
    bookingId: id,
    actorId: vendorUserId
  });

  const customerProfile = await User.findById(completedBooking.userId).lean();
  const dto = toVendorBookingDTO(completedBooking, customerProfile);

  res.status(200).json({ success: true, message: 'Booking marked as completed.', data: dto });
});
