import {
  getAllVendors,
  getVendorByIdRepo,
  updateVendorVerificationStatus,
} from "../../repositories/admin/adminVendorRepository.js";

export const getVendorsService = async (options) => {
  return await getAllVendors(options);
};

export const getVendorByIdService = async (vendorId) => {
  let vendor = await getVendorByIdRepo(vendorId);
  if (!vendor) {
    throw new Error("Vendor not found");
  }

  if (vendor.onboardingStatus === 'requested' || vendor.onboardingStatus === 'changes_requested') {
    vendor = await updateVendorVerificationStatus(vendorId, 'under_review', vendor.adminRemarks);
  }

  return vendor;
};

export const verifyVendorService = async (vendorId, status, adminRemarks) => {
  const vendor = await updateVendorVerificationStatus(vendorId, status, adminRemarks);
  if (!vendor) {
    throw new Error("Vendor profile not found");
  }
  return vendor;
};
