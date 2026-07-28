import mongoose from 'mongoose';
import Venue from '../../models/venueModel.js';
import Booking from '../../models/bookingModel.js';
import Wallet from '../../models/walletModel.js';
import WalletTransaction from '../../models/walletTransactionModel.js';

export const getDashboardDataService = async (vendorId, timeRange = '30') => {
  const objectIdVendorId = new mongoose.Types.ObjectId(vendorId);
  const days = parseInt(timeRange, 10) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // 1. Get all venues for this vendor
  const vendorVenues = await Venue.find({ vendorId: objectIdVendorId }, '_id').lean();
  const venueIds = vendorVenues.map(v => v._id);

  // 2. Active Venue Count
  const activeVenuesCount = await Venue.countDocuments({ 
    vendorId: objectIdVendorId, 
    venueStatus: 'active' 
  });

  // 3. Wallet Stats
  const wallet = await Wallet.findOne({ ownerId: objectIdVendorId, ownerType: 'vendor' }).lean();
  let pendingPayouts = 0;
  let totalBalance = wallet ? wallet.currentBalance : 0;
  
  // Calculate pending payouts (Completed bookings with Pending payment status)
  if (venueIds.length > 0) {
    const pendingAggregation = await Booking.aggregate([
      { 
        $match: { 
          venueId: { $in: venueIds },
          bookingStatus: 'Completed',
          paymentStatus: 'Pending'
        } 
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: "$totalAmount" }
        }
      }
    ]);
    pendingPayouts = pendingAggregation[0]?.totalPending || 0;
  }

  // 4. Action Items (Requires Attention Widget)
  const actionItems = [];
  
  // Drafts
  const drafts = await Venue.find({ vendorId: objectIdVendorId, 'approval.status': 'draft' })
    .select('name slug')
    .sort({ updatedAt: -1 })
    .lean();
  drafts.forEach(v => actionItems.push({
    type: 'draft',
    id: v._id,
    title: v.name || 'Untitled Venue',
    message: 'Continue your venue setup',
    actionText: 'Continue',
    actionLink: `/vendor/venues/edit/${v._id}`
  }));

  // Rejected
  const rejected = await Venue.find({ vendorId: objectIdVendorId, 'approval.status': 'rejected' })
    .select('name slug approval.rejectionReason')
    .sort({ updatedAt: -1 })
    .lean();
  rejected.forEach(v => actionItems.push({
    type: 'rejected',
    id: v._id,
    title: v.name,
    message: v.approval.rejectionReason || 'Venue was rejected by admin',
    actionText: 'Review',
    actionLink: `/vendor/venues/${v._id}`
  }));

  // Slot Confirmations (Approved but hasAcknowledgedSlots is false)
  const needsSlots = await Venue.find({ 
    vendorId: objectIdVendorId, 
    'approval.status': 'approved',
    hasAcknowledgedSlots: false
  })
    .select('name slug')
    .sort({ updatedAt: -1 })
    .lean();
  needsSlots.forEach(v => actionItems.push({
    type: 'slots',
    id: v._id,
    title: v.name,
    message: 'Action required: Confirm your venue slots',
    actionText: 'Manage Slots',
    actionLink: `/vendor/venues/${v._id}`
  }));

  // Sort action items (priority: rejected > slots > draft)
  const priorityMap = { rejected: 1, slots: 2, draft: 3 };
  actionItems.sort((a, b) => priorityMap[a.type] - priorityMap[b.type]);

  // 5. Chart Data (Revenue and Bookings over time)
  let chartData = [];
  if (venueIds.length > 0) {
    const rawChartData = await Booking.aggregate([
      {
        $match: {
          venueId: { $in: venueIds },
          bookingDate: { $gte: startDate },
          bookingStatus: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } },
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dateMap = {};
    rawChartData.forEach(item => { dateMap[item._id] = item; });
    
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      
      chartData.push({
        date: dateString,
        revenue: dateMap[dateString]?.revenue || 0,
        bookings: dateMap[dateString]?.bookings || 0
      });
    }
  }

  // 6. Top Performing Venues
  let topPerformers = [];
  if (venueIds.length > 0) {
    topPerformers = await Booking.aggregate([
      { $match: { venueId: { $in: venueIds }, bookingStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: "$venueId", totalBookings: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
      { $sort: { totalBookings: -1, revenue: -1 } },
      { $limit: 3 },
      { $lookup: { from: 'venues', localField: '_id', foreignField: '_id', as: 'venueInfo' } },
      { $unwind: "$venueInfo" },
      { $project: {
          id: "$_id",
          name: "$venueInfo.name",
          totalBookings: 1,
          revenue: 1,
          image: { $arrayElemAt: ["$venueInfo.images", 0] }
        }
      }
    ]);
  }

  // 7. Recent Wallet History
  let walletHistory = [];
  if (wallet) {
    walletHistory = await WalletTransaction.find({ walletId: wallet._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  return {
    walletStats: {
      balance: totalBalance,
      pendingPayouts,
    },
    activeVenuesCount,
    actionItems,
    chartData,
    topPerformers,
    walletHistory
  };
};
