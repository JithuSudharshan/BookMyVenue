import Admin from "../models/Admin.js";
import User from "../models/User.js";
import VendorProfile from "../models/VendorProfile.js";
import CustomerProfile from "../models/CustomerProfile.js";
import Venue from "../models/Venue.js";

export const findAdminByEmail = async (email) => {
  return await Admin.findOne({ email }).select("+password");
};

export const getAllUsers = async ({ search, status, page = 1, limit = 10 } = {}) => {
  let userQuery = { role: "user" };

  if (status === 'Active') {
    userQuery.isBlocked = false;
  } else if (status === 'Suspended') {
    userQuery.isBlocked = true;
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    const profiles = await CustomerProfile.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    }).select("userId");
    const userIds = profiles.map(p => p.userId);
    userQuery.$or = [
      { email: searchRegex },
      { _id: { $in: userIds } }
    ];
  }

  const total = await User.countDocuments(userQuery);
  const skip = (page - 1) * limit;
  const data = await User.find(userQuery)
    .populate("profile")
    .skip(skip)
    .limit(limit);

  return { data, total };
};

export const getUserByIdRepo = async (userId) => {
  return await User.findOne({ _id: userId, role: { $in: ["user", "vendor"] } }).populate("profile");
};

export const getAllVendors = async ({ search, status, accountStatus, page = 1, limit = 10 } = {}) => {
  let vendorQuery = {};

  if (status && status !== 'All') {
    vendorQuery.onboardingStatus = status.toLowerCase();
  }

  if (accountStatus && accountStatus !== 'All') {
    const isBlocked = accountStatus === 'Suspended';
    const users = await User.find({ role: 'vendor', isBlocked }).select('_id');
    const userIds = users.map(u => u._id);
    vendorQuery.userId = { $in: userIds };
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    const users = await User.find({ role: 'vendor', email: searchRegex }).select('_id');
    const userIds = users.map(u => u._id);

    vendorQuery.$or = [
      { businessName: searchRegex },
      { fullName: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
      { userId: { $in: userIds } }
    ];
  }

  const total = await VendorProfile.countDocuments(vendorQuery);
  const skip = (page - 1) * limit;
  const data = await VendorProfile.find(vendorQuery)
    .populate("userId", "email role isBlocked createdAt")
    .skip(skip)
    .limit(limit);

  return { data, total };
};

export const getVendorByIdRepo = async (vendorId) => {
  return await VendorProfile.findById(vendorId).populate(
    "userId",
    "email role isBlocked createdAt"
  );
};

export const updateUserBlockStatusById = async (userId, isBlocked) => {
  return await User.findOneAndUpdate(
    { _id: userId, role: { $in: ["user", "vendor"] } },
    { isBlocked },
    { new: true }
  );
};

export const updateVendorVerificationStatus = async (vendorId, status, adminRemarks) => {
  const updateData = { onboardingStatus: status };
  if (status === "rejected" && adminRemarks) {
    updateData.adminRemarks = adminRemarks;
  }
  return await VendorProfile.findByIdAndUpdate(
    vendorId,
    updateData,
    { new: true }
  ).populate("userId", "email role isBlocked createdAt");
};

export const getDashboardCounts = async () => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalVendors = await User.countDocuments({ role: "vendor" });
  const pendingVerifications = await VendorProfile.countDocuments({
    onboardingStatus: "pending",
  });

  const recentPendingVendors = await VendorProfile.find({
    onboardingStatus: "pending",
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .select("businessName createdAt");

  const totalVenues = await Venue.countDocuments();

  return {
    totalUsers,
    totalVendors,
    pendingVerifications,
    recentPendingVendors,
    totalVenues,
  };
};

export const getAllVenuesAdmin = async ({ search, status, sort, page = 1, limit = 10 } = {}) => {
  let query = {};
  if (status && status !== 'All') {
    if (status.toLowerCase() === 'pending') {
      query['approval.status'] = { $in: ['submitted', 'under_review', 'pending'] };
    } else {
      query['approval.status'] = status.toLowerCase();
    }
  } else {
    query['approval.status'] = { $ne: 'draft' };
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { name: searchRegex },
      { 'location.city': searchRegex },
      { 'location.state': searchRegex }
    ];
  }

  // Build sort object - default to newest first
  let sortObj = { createdAt: -1 };
  if (sort) {
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    sortObj = { [sortField]: sortOrder };
  }

  const total = await Venue.countDocuments(query);
  const skip = (page - 1) * limit;
  const data = await Venue.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  return { data, total };
};

export const getVenueByIdAdmin = async (venueId) => {
  return await Venue.findById(venueId);
};

export const updateVenueStatusAdmin = async (venueId, status, rejectionReason, adminUserId) => {
  const updateData = {
    'approval.status': status,
    'approval.reviewedAt': new Date(),
  };
  if (adminUserId) {
    updateData['approval.reviewedBy'] = adminUserId;
  }
  if (status === 'rejected' && rejectionReason) {
    updateData['approval.rejectionReason'] = rejectionReason;
  }
  if (status === 'approved') {
    updateData.venueStatus = 'active';
  } else if (status === 'rejected') {
    updateData.venueStatus = 'inactive';
  }
  return await Venue.findByIdAndUpdate(venueId, updateData, { new: true });
};

export const getVendorProfileForVenueAdmin = async (venue) => {
  if (!venue || !venue.vendorId) return null;
  let profile = await VendorProfile.findById(venue.vendorId);
  if (!profile) {
    profile = await VendorProfile.findOne({ userId: venue.vendorId });
  }
  return profile;
};
