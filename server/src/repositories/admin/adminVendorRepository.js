import User from "../../models/userModel.js";
import Vendor from "../../models/vendorModel.js";

export const getAllVendors = async ({ search, status, accountStatus, page = 1, limit = 10 } = {}) => {
  let vendorQuery = {};

  if (status && status !== 'All') {
    if (status.toLowerCase() === 'pending') {
      vendorQuery.onboardingStatus = { $in: ['requested', 'changes_requested', 'under_review'] };
    } else {
      vendorQuery.onboardingStatus = status.toLowerCase();
    }
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
      { fullName: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
      { userId: { $in: userIds } }
    ];
  }

  const total = await Vendor.countDocuments(vendorQuery);
  const skip = (page - 1) * limit;
  const data = await Vendor.find(vendorQuery)
    .populate("userId", "email role isBlocked createdAt")
    .skip(skip)
    .limit(limit);

  return { data, total };
};

export const getVendorByIdRepo = async (vendorId) => {
  return await Vendor.findById(vendorId).populate(
    "userId",
    "email role isBlocked createdAt"
  );
};

export const updateVendorVerificationStatus = async (vendorId, status, adminRemarks) => {
  const updateData = { onboardingStatus: status };
  if (status === "rejected" && adminRemarks) {
    updateData.adminRemarks = adminRemarks;
  }
  return await Vendor.findByIdAndUpdate(
    vendorId,
    updateData,
    { new: true }
  ).populate("userId", "email role isBlocked createdAt");
};
