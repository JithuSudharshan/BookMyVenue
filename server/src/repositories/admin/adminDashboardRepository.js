import User from "../../models/userModel.js";
import Vendor from "../../models/vendorModel.js";
import Venue from "../../models/venueModel.js";

export const getDashboardCounts = async () => {
  const totalUsers = await User.countDocuments({ role: "customer" });
  const totalVendors = await User.countDocuments({ role: "vendor" });
  const pendingVerifications = await Vendor.countDocuments({
    onboardingStatus: { $in: ['requested', 'changes_requested', 'under_review'] },
  });

  const recentPendingVendors = await Vendor.find({
    onboardingStatus: { $in: ['requested', 'changes_requested', 'under_review'] },
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .select("fullName createdAt");

  const totalVenues = await Venue.countDocuments({ 'approval.status': { $ne: 'draft' } });
  const pendingApprovalVenues = await Venue.countDocuments({
    'approval.status': { $in: ['submitted', 'under_review'] },
  });
  const approvedVenues = await Venue.countDocuments({ 'approval.status': 'approved' });
  const rejectedVenues = await Venue.countDocuments({ 'approval.status': 'rejected' });

  const approvedVendors = await Vendor.countDocuments({ onboardingStatus: "approved" });
  const suspendedVendors = await User.countDocuments({ role: "vendor", isBlocked: true });

  return {
    totalUsers,
    totalVendors,
    pendingVerifications,
    recentPendingVendors,
    totalVenues,
    approvedVendors,
    suspendedVendors,
    pendingApprovalVenues,
    approvedVenues,
    rejectedVenues,
  };
};
