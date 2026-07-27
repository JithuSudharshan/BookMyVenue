import mongoose from 'mongoose';
import User from "../../models/userModel.js";
import Vendor from "../../models/vendorModel.js";
import Venue from "../../models/venueModel.js";
import Booking from "../../models/bookingModel.js";
import Wallet from "../../models/walletModel.js";

const CONFIRMED_STATUSES = ['Confirmed', 'Completed', 'confirmed', 'completed', 'CONFIRMED', 'COMPLETED'];

// Helper: Calculate date ranges based on priority rules
export const resolveDateRange = ({ timeframe, startDate, endDate }) => {
  const now = new Date();
  let start = new Date();
  let end = new Date();
  let isAll = false;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    const tf = (timeframe || 'all').toLowerCase().replace(/\s+/g, '_');

    if (tf === 'all' || tf === 'all_time') {
      isAll = true;
      start = new Date(0);
      end = new Date('2099-12-31T23:59:59.999Z');
    } else if (tf === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (tf === 'last_7_days') {
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (tf === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (tf === 'this_year') {
      start = new Date(now.getFullYear(), 0, 1);
    } else {
      // Default: 'this_month'
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  // Calculate previous period for comparison
  const durationMs = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - durationMs);
  const prevEnd = new Date(start.getTime() - 1);

  return { start, end, prevStart, prevEnd, isAll };
};

// Helper: Build resilient booking query match
const buildBookingMatch = (statusArray, start, end, isAll) => {
  const statusMatch = statusArray ? { bookingStatus: { $in: statusArray } } : {};
  if (isAll) return statusMatch;

  return {
    ...statusMatch,
    $or: [
      { createdAt: { $gte: start, $lte: end } },
      { bookingDate: { $gte: start, $lte: end } }
    ]
  };
};

// 1. Header Action Item Badges
export const getHeaderCounts = async () => {
  const pendingVendors = await Vendor.countDocuments({
    onboardingStatus: { $in: ['requested', 'changes_requested', 'under_review'] },
  });
  const pendingVenues = await Venue.countDocuments({
    'approval.status': { $in: ['submitted', 'under_review'] },
  });
  return { pendingVendors, pendingVenues };
};

// 2. KPI Cards with growth comparison
export const getKpiMetrics = async (dateRange) => {
  const { start, end, prevStart, prevEnd, isAll } = dateRange;

  // --- Total Revenue & Commission (20%) ---
  const currentRevAggregation = await Booking.aggregate([
    {
      $match: buildBookingMatch(CONFIRMED_STATUSES, start, end, isAll),
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const prevRevAggregation = isAll
    ? []
    : await Booking.aggregate([
        {
          $match: buildBookingMatch(CONFIRMED_STATUSES, prevStart, prevEnd, false),
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]);

  const totalRevenue = currentRevAggregation[0]?.total || 0;
  const prevRevenue = prevRevAggregation[0]?.total || 0;
  const revenueGrowth = prevRevenue > 0 ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : 0;

  const platformCommission = totalRevenue * 0.20;
  const prevCommission = prevRevenue * 0.20;
  const commissionGrowth = prevCommission > 0 ? (((platformCommission - prevCommission) / prevCommission) * 100).toFixed(1) : 0;

  // --- Total Bookings ---
  const currentBookingQuery = buildBookingMatch(null, start, end, isAll);
  const totalBookings = await Booking.countDocuments(currentBookingQuery);

  const prevBookingQuery = isAll ? { _id: null } : buildBookingMatch(null, prevStart, prevEnd, false);
  const prevBookings = isAll ? 0 : await Booking.countDocuments(prevBookingQuery);
  const bookingsGrowth = prevBookings > 0 ? (((totalBookings - prevBookings) / prevBookings) * 100).toFixed(1) : 0;

  // --- Total Users ---
  const userFilter = isAll ? { role: 'customer' } : { role: 'customer', createdAt: { $lte: end } };
  const totalUsers = await User.countDocuments(userFilter);
  const prevUsers = isAll ? 0 : await User.countDocuments({ role: 'customer', createdAt: { $lte: prevStart } });
  const usersGrowth = prevUsers > 0 ? (((totalUsers - prevUsers) / prevUsers) * 100).toFixed(1) : 0;

  // --- Active Vendors ---
  const vendorFilter = isAll ? { onboardingStatus: 'approved' } : { onboardingStatus: 'approved', createdAt: { $lte: end } };
  const activeVendors = await Vendor.countDocuments(vendorFilter);
  const prevVendors = isAll ? 0 : await Vendor.countDocuments({ onboardingStatus: 'approved', createdAt: { $lte: prevStart } });
  const vendorsGrowth = prevVendors > 0 ? (((activeVendors - prevVendors) / prevVendors) * 100).toFixed(1) : 0;

  // --- Total Venues ---
  const venueFilter = isAll ? { 'approval.status': 'approved' } : { 'approval.status': 'approved', createdAt: { $lte: end } };
  const totalVenues = await Venue.countDocuments(venueFilter);
  const prevVenues = isAll ? 0 : await Venue.countDocuments({ 'approval.status': 'approved', createdAt: { $lte: prevStart } });
  const venuesGrowth = prevVenues > 0 ? (((totalVenues - prevVenues) / prevVenues) * 100).toFixed(1) : 0;

  return {
    totalRevenue: { value: totalRevenue, growth: Number(revenueGrowth) },
    platformCommission: { value: platformCommission, growth: Number(commissionGrowth) },
    totalBookings: { value: totalBookings, growth: Number(bookingsGrowth) },
    totalUsers: { value: totalUsers, growth: Number(usersGrowth) },
    activeVendors: { value: activeVendors, growth: Number(vendorsGrowth) },
    totalVenues: { value: totalVenues, growth: Number(venuesGrowth) },
  };
};

// 3. Analytics Charts
export const getChartAnalytics = async (dateRange) => {
  const { start, end, isAll } = dateRange;
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Generate full trailing 7 months slots (ending at current month)
  const monthSlots = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthSlots.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1, // 1-indexed for MongoDB
      label: MONTH_NAMES[d.getMonth()],
    });
  }

  const sevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1, 0, 0, 0, 0);

  // Date expression with fallback for raw documents lacking createdAt
  const dateExpr = { $ifNull: ['$createdAt', { $ifNull: ['$bookingDate', new Date()] }] };

  // Revenue & Breakdown Trend
  const revTrend = await Booking.aggregate([
    {
      $match: {
        bookingStatus: { $in: CONFIRMED_STATUSES },
      },
    },
    {
      $group: {
        _id: { year: { $year: dateExpr }, month: { $month: dateExpr } },
        revenue: { $sum: '$totalAmount' },
      },
    },
  ]);

  const revTrendMap = new Map();
  revTrend.forEach((item) => {
    revTrendMap.set(`${item._id.year}-${item._id.month}`, item.revenue);
  });

  const revenueTrendData = monthSlots.map((slot) => {
    const rev = revTrendMap.get(`${slot.year}-${slot.month}`) || 0;
    const comm = rev * 0.20;
    const vendorEarn = rev * 0.80;
    return {
      month: slot.label,
      revenue: rev,
      commission: comm,
      vendorEarnings: vendorEarn,
    };
  });

  // Booking Trend
  const bookingTrendRaw = await Booking.aggregate([
    {
      $group: {
        _id: { year: { $year: dateExpr }, month: { $month: dateExpr } },
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $in: ['$bookingStatus', ['Completed', 'completed', 'COMPLETED']] }, 1, 0],
          },
        },
        cancelled: {
          $sum: {
            $cond: [{ $in: ['$bookingStatus', ['Cancelled', 'cancelled', 'CANCELLED']] }, 1, 0],
          },
        },
        pending: {
          $sum: {
            $cond: [{ $in: ['$bookingStatus', ['Pending', 'pending', 'PENDING']] }, 1, 0],
          },
        },
      },
    },
  ]);

  const bookingTrendMap = new Map();
  bookingTrendRaw.forEach((item) => {
    bookingTrendMap.set(`${item._id.year}-${item._id.month}`, item);
  });

  const bookingTrendData = monthSlots.map((slot) => {
    const item = bookingTrendMap.get(`${slot.year}-${slot.month}`);
    return {
      month: slot.label,
      total: item ? item.total : 0,
      completed: item ? item.completed : 0,
      cancelled: item ? item.cancelled : 0,
      pending: item ? item.pending : 0,
    };
  });

  // Booking Status Distribution for selected date range
  const statusMatch = isAll ? {} : buildBookingMatch(null, start, end, false);
  const statusDistRaw = await Booking.aggregate([
    { $match: statusMatch },
    {
      $group: {
        _id: '$bookingStatus',
        value: { $sum: 1 },
      },
    },
  ]);

  const COLOR_MAP = {
    Completed: '#10B981',
    completed: '#10B981',
    Confirmed: '#3B82F6',
    confirmed: '#3B82F6',
    Pending: '#F59E0B',
    pending: '#F59E0B',
    Cancelled: '#EF4444',
    cancelled: '#EF4444',
  };

  const bookingStatusDistribution = statusDistRaw.map((item) => ({
    name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
    value: item.value,
    color: COLOR_MAP[item._id] || '#71717A',
  }));

  return {
    revenueTrend: revenueTrendData,
    bookingTrend: bookingTrendData,
    bookingStatusDistribution,
  };
};

// 4. Financial Summary
export const getFinancialSummary = async () => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const startOfLastYear = new Date(new Date().getFullYear() - 1, 0, 1);
  const endOfLastYear = new Date(new Date().getFullYear() - 1, 11, 31, 23, 59, 59, 999);

  // Lifetime / YTD Revenue
  const ytdRevAgg = await Booking.aggregate([
    {
      $match: {
        bookingStatus: { $in: CONFIRMED_STATUSES },
      },
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const grossRevenueYTD = ytdRevAgg[0]?.total || 0;
  const platformCommissionYTD = grossRevenueYTD * 0.20;
  const vendorPayoutsYTD = grossRevenueYTD * 0.80;

  // YoY Growth Comparison
  const lastYearRevAgg = await Booking.aggregate([
    {
      $match: {
        bookingStatus: { $in: CONFIRMED_STATUSES },
        createdAt: { $gte: startOfLastYear, $lte: endOfLastYear },
      },
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const lastYearRev = lastYearRevAgg[0]?.total || 0;
  const yoyGrowth = lastYearRev > 0 ? (((grossRevenueYTD - lastYearRev) / lastYearRev) * 100).toFixed(1) : 0;

  // Refund Total
  const refundAgg = await Booking.aggregate([
    {
      $match: {
        paymentStatus: { $in: ['Refunded', 'refunded'] },
      },
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
  ]);
  const refundTotalYTD = refundAgg[0]?.total || 0;
  const refundCountYTD = refundAgg[0]?.count || 0;

  const totalYtdBookings = await Booking.countDocuments();
  const refundRate = totalYtdBookings > 0 ? ((refundCountYTD / totalYtdBookings) * 100).toFixed(2) : 0;

  // Pending Vendor Settlements (vendor wallets current balance sum)
  const pendingSettlementAgg = await Wallet.aggregate([
    { $match: { ownerType: 'vendor' } },
    { $group: { _id: null, total: { $sum: '$currentBalance' } } },
  ]);
  const pendingSettlements = pendingSettlementAgg[0]?.total || 0;

  return {
    grossRevenueYTD,
    platformCommissionYTD,
    vendorPayoutsYTD,
    refundTotalYTD,
    refundRate: Number(refundRate),
    yoyGrowth: Number(yoyGrowth),
    pendingSettlements,
  };
};

// 5. Register Tables Registers
export const getRegisterTables = async () => {
  // Recent Bookings (5)
  const recentBookingsRaw = await Booking.find()
    .populate({
      path: 'userId',
      select: 'email',
      populate: { path: 'profile', select: 'firstName lastName' },
    })
    .populate('venueId', 'name')
    .sort({ createdAt: -1, bookingDate: -1, _id: -1 })
    .limit(5);

  const recentBookings = recentBookingsRaw.map((b) => {
    const customerProfile = b.userId?.profile;
    const customerName = customerProfile
      ? `${customerProfile.firstName || ''} ${customerProfile.lastName || ''}`.trim()
      : 'Guest User';
    return {
      id: `BK-${b._id.toString().slice(-5).toUpperCase()}`,
      rawId: b._id,
      customer: customerName || 'Customer',
      email: b.userId?.email || 'N/A',
      venue: b.venueId?.name || 'N/A',
      date: new Date(b.bookingDate || b.createdAt || Date.now()).toISOString().split('T')[0],
      amount: b.totalAmount || 0,
      status: (b.bookingStatus || 'pending').toLowerCase(),
    };
  });

  // Recent Vendors (5)
  const recentVendorsRaw = await Vendor.find()
    .populate('userId', 'email createdAt')
    .sort({ createdAt: -1, _id: -1 })
    .limit(5);

  const recentVendors = recentVendorsRaw.map((v) => ({
    id: `VND-${v._id.toString().slice(-5).toUpperCase()}`,
    rawId: v._id,
    vendor: v.fullName || (v.firstName ? `${v.firstName} ${v.lastName || ''}`.trim() : 'Vendor'),
    email: v.userId?.email || 'N/A',
    joined: new Date(v.createdAt || Date.now()).toISOString().split('T')[0],
    status: v.onboardingStatus || 'incomplete',
  }));

  // Recent Users (5)
  const recentUsersRaw = await User.find({ role: 'customer' })
    .populate('profile', 'firstName lastName')
    .sort({ createdAt: -1, _id: -1 })
    .limit(5);

  const recentUsers = recentUsersRaw.map((u) => ({
    id: `USR-${u._id.toString().slice(-5).toUpperCase()}`,
    rawId: u._id,
    name: u.profile ? `${u.profile.firstName || ''} ${u.profile.lastName || ''}`.trim() : 'Customer',
    email: u.email,
    joined: new Date(u.createdAt || Date.now()).toISOString().split('T')[0],
    status: u.isBlocked ? 'blocked' : 'active',
  }));

  // Top Venues (5)
  const topVenuesAgg = await Booking.aggregate([
    { $match: { bookingStatus: { $in: CONFIRMED_STATUSES } } },
    {
      $group: {
        _id: '$venueId',
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'venues',
        localField: '_id',
        foreignField: '_id',
        as: 'venue',
      },
    },
    { $unwind: '$venue' },
  ]);

  const topVenues = topVenuesAgg.map((tv) => ({
    id: `VN-${tv.venue._id.toString().slice(-5).toUpperCase()}`,
    rawId: tv.venue._id,
    name: tv.venue.name,
    city: tv.venue.location?.city || 'N/A',
    bookings: tv.bookings,
    revenue: tv.revenue,
  }));

  // Top Vendors (5)
  const topVendorsAgg = await Booking.aggregate([
    { $match: { bookingStatus: { $in: CONFIRMED_STATUSES } } },
    {
      $lookup: {
        from: 'venues',
        localField: 'venueId',
        foreignField: '_id',
        as: 'venue',
      },
    },
    { $unwind: '$venue' },
    {
      $group: {
        _id: '$venue.vendorId',
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'vendors',
        localField: '_id',
        foreignField: 'userId',
        as: 'vendor',
      },
    },
    { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
  ]);

  const topVendors = await Promise.all(
    topVendorsAgg.map(async (tvn) => {
      const venueCount = await Venue.countDocuments({ vendorId: tvn._id });
      const vendorName = tvn.vendor
        ? tvn.vendor.fullName || `${tvn.vendor.firstName || ''} ${tvn.vendor.lastName || ''}`.trim()
        : 'Vendor';
      return {
        id: `VND-${tvn._id.toString().slice(-5).toUpperCase()}`,
        rawId: tvn._id,
        name: vendorName || 'Vendor',
        venues: venueCount,
        bookings: tvn.bookings,
        revenue: tvn.revenue,
      };
    })
  );

  return {
    recentBookings,
    recentVendors,
    recentUsers,
    topVenues,
    topVendors,
  };
};

export const getDashboardFullData = async (queryOptions) => {
  const dateRange = resolveDateRange(queryOptions);

  const [header, kpis, charts, financialSummary, tables] = await Promise.all([
    getHeaderCounts(),
    getKpiMetrics(dateRange),
    getChartAnalytics(dateRange),
    getFinancialSummary(),
    getRegisterTables(),
  ]);

  return {
    header,
    kpis,
    charts,
    financialSummary,
    tables,
  };
};
