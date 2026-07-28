import catchAsync from '../utils/catchAsync.js';
import * as vendorBookingService from '../services/core/vendorBookingService.js';
import bookingLifecycleOrchestrator from '../services/core/BookingLifecycleOrchestrator.js';

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
  
  const cancelledBooking = await bookingLifecycleOrchestrator.cancelBooking(id, 'vendor', {
    reason: reason || 'Vendor requested cancellation',
    description
  });
  
  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: cancelledBooking
  });
});
