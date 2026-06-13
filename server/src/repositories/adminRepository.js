import Admin from "../models/Admin.js";
import User from "../models/User.js";
import VendorProfile from "../models/VendorProfile.js";
import CustomerProfile from "../models/CustomerProfile.js";

export const findAdminByEmail = async (email) => {
  return await Admin.findOne({ email }).select("+password");
};

export const getAllUsers = async () => {
  return await User.find({ role: "user" }).populate("profile");
};

export const getAllVendors = async () => {
  return await VendorProfile.find().populate(
    "userId",
    "email role isBlocked createdAt"
  );
};

export const blockUserById = async (userId) => {
  return await User.findOneAndUpdate(
    { _id: userId, role: { $in: ["user", "vendor"] } },
    { isBlocked: true },
    { new: true }
  );
};

export const unblockUserById = async (userId) => {
  return await User.findOneAndUpdate(
    { _id: userId, role: { $in: ["user", "vendor"] } },
    { isBlocked: false },
    { new: true }
  );
};

export const updateVendorVerificationStatus = async (vendorId, status, rejectReason) => {
  const updateData = { verificationStatus: status };
  if (status === "rejected" && rejectReason) {
    updateData.rejectReason = rejectReason;
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
    verificationStatus: "pending",
  });

  // Fetch up to 3 recent pending vendor applications for the dashboard list
  const recentPendingVendors = await VendorProfile.find({
    verificationStatus: "pending",
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .select("businessName createdAt");

  // TODO (Phase 2): Replace with actual Venue count once the model is created
  const totalVenues = 0;

  return {
    totalUsers,
    totalVendors,
    pendingVerifications,
    recentPendingVendors,
    totalVenues,
  };
};
