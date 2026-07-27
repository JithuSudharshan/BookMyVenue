import Booking from '../../models/bookingModel.js';
import AppError from '../../utils/AppError.js';
import Venue from '../../models/venueModel.js';

/**
 * Fetch paginated bookings for a vendor, with optional filters.
 */
export const getVendorBookings = async (vendorUserId, { page = 1, limit = 10, status, venueId, bookingMode, search } = {}) => {
  if (!vendorUserId) throw new AppError('Unauthorized.', 401);

  const query = { vendorId: vendorUserId };

  if (status && status !== 'all') {
    if (status === 'upcoming') {
      query.bookingStatus = { $in: ['pending', 'confirmed'] };
    } else {
      query.bookingStatus = status;
    }
  }

  if (venueId) {
    query.venueId = venueId;
  }

  if (bookingMode) {
    query.bookingMode = bookingMode;
  }

  const skip = (page - 1) * limit;

  const bookings = await Booking.find(query)
    .populate('venueId', 'name location images')
    .populate('userId', 'email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // If searching by customer name/booking number, filter post-populate
  let filtered = bookings;
  if (search) {
    const lower = search.toLowerCase();
    filtered = bookings.filter(b =>
      b.bookingNumber?.toLowerCase().includes(lower)
    );
  }

  const total = await Booking.countDocuments(query);

  return {
    bookings: filtered,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get KPI stats for a vendor's booking dashboard.
 */
export const getVendorBookingStats = async (vendorUserId) => {
  if (!vendorUserId) throw new AppError('Unauthorized.', 401);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const [upcoming, completed, cancelled, todayBookings, todayRevenue] = await Promise.all([
    Booking.countDocuments({ vendorId: vendorUserId, bookingStatus: { $in: ['pending', 'confirmed'] } }),
    Booking.countDocuments({ vendorId: vendorUserId, bookingStatus: 'completed' }),
    Booking.countDocuments({ vendorId: vendorUserId, bookingStatus: 'cancelled' }),
    Booking.countDocuments({
      vendorId: vendorUserId,
      $or: [{ date: todayStr }, { startDate: todayStr }],
    }),
    Booking.aggregate([
      {
        $match: {
          vendorId: vendorUserId,
          paymentStatus: { $in: ['completed', 'partial'] },
          createdAt: { $gte: today },
        },
      },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } },
    ]),
  ]);

  return {
    upcoming,
    completed,
    cancelled,
    todayBookings,
    todayRevenue: todayRevenue[0]?.total || 0,
  };
};

/**
 * Get all venues belonging to this vendor (for filter dropdown).
 */
export const getVendorVenueList = async (vendorUserId) => {
  return Venue.find({ vendorId: vendorUserId, status: 'approved' }, '_id name').lean();
};
