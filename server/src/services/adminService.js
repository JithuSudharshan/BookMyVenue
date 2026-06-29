import jwt from "jsonwebtoken";

import {
  findAdminByEmail,
  getAllUsers,
  getUserByIdRepo,
  getAllVendors,
  getVendorByIdRepo,
  updateUserBlockStatusById,
  updateVendorVerificationStatus,
  getDashboardCounts,
  getAllVenuesAdmin,
  getVenueByIdAdmin,
  updateVenueStatusAdmin,
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

export const getUsersService = async (options) => {
  return await getAllUsers(options);
};

export const getUserByIdService = async (userId) => {
  const user = await getUserByIdRepo(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const getVendorsService = async (options) => {
  return await getAllVendors(options);
};

export const getVendorByIdService = async (vendorId) => {
  const vendor = await getVendorByIdRepo(vendorId);
  if (!vendor) {
    throw new Error("Vendor not found");
  }
  return vendor;
};

export const updateUserBlockStatusService = async (userId, isBlocked) => {
  const user = await updateUserBlockStatusById(userId, isBlocked);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const verifyVendorService = async (vendorId, status, adminRemarks) => {
  const vendor = await updateVendorVerificationStatus(vendorId, status, adminRemarks);
  if (!vendor) {
    throw new Error("Vendor profile not found");
  }
  return vendor;
};

export const getDashboardStatsService = async () => {
  return await getDashboardCounts();
};

export const getAdminVenuesService = async (options) => {
  return await getAllVenuesAdmin(options);
};

export const getAdminVenueByIdService = async (venueId) => {
  const venue = await getVenueByIdAdmin(venueId);
  if (!venue) {
    throw new Error("Venue not found");
  }
  return venue;
};

export const updateVenueStatusService = async (venueId, status, rejectionReason, adminUserId) => {
  // First fetch the venue to validate status transition
  const existingVenue = await getVenueByIdAdmin(venueId);
  if (!existingVenue) {
    throw new Error("Venue not found");
  }

  const currentStatus = existingVenue.approval?.status;

  // Prevent acting on draft venues
  if (currentStatus === 'draft') {
    throw new Error("Cannot approve or reject a venue that is still in draft status");
  }

  // Prevent double approval
  if (status === 'approved' && currentStatus === 'approved') {
    throw new Error("Venue is already approved");
  }

  // Prevent double rejection
  if (status === 'rejected' && currentStatus === 'rejected') {
    throw new Error("Venue is already rejected");
  }

  const venue = await updateVenueStatusAdmin(venueId, status, rejectionReason, adminUserId);
  if (!venue) {
    throw new Error("Venue not found");
  }
  return venue;
};
