import jwt from "jsonwebtoken";

import {
  findAdminByEmail,
  getAllUsers,
  getAllVendors,
  blockUserById,
  unblockUserById,
  updateVendorVerificationStatus,
  getDashboardCounts,
} from "../repositories/adminRepository.js";

const generateAdminToken = (adminId) => {
  return jwt.sign(
    { id: adminId },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export const loginAdminService = async (email, password) => {
  const admin = await findAdminByEmail(email);

  if (!admin) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    token: generateAdminToken(admin._id),
  };
};

export const getUsersService = async () => {
  return await getAllUsers();
};

export const getVendorsService = async () => {
  return await getAllVendors();
};

export const blockUserService = async (userId) => {
  const user = await blockUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const unblockUserService = async (userId) => {
  const user = await unblockUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const verifyVendorService = async (vendorId, status, rejectReason) => {
  const vendor = await updateVendorVerificationStatus(vendorId, status, rejectReason);
  if (!vendor) {
    throw new Error("Vendor profile not found");
  }
  return vendor;
};

export const getDashboardStatsService = async () => {
  return await getDashboardCounts();
};
