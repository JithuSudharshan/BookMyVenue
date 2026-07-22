import User from "../../models/userModel.js";
import Customer from "../../models/customerModel.js";

export const getAllUsers = async ({ search, status, page = 1, limit = 10 } = {}) => {
  let userQuery = { role: "customer" };

  if (status === 'Active') {
    userQuery.isBlocked = false;
  } else if (status === 'Suspended') {
    userQuery.isBlocked = true;
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    const profiles = await Customer.find({
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
  return await User.findOne({ _id: userId, role: { $in: ["customer", "vendor"] } }).populate("profile");
};

export const updateUserBlockStatusById = async (userId, isBlocked) => {
  return await User.findOneAndUpdate(
    { _id: userId, role: { $in: ["customer", "vendor"] } },
    { isBlocked },
    { new: true }
  );
};
