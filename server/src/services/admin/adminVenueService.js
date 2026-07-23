import {
  getAllVenuesAdmin,
  getVenueByIdAdmin,
  updateVenueStatusAdmin,
  updateVenueVisibilityAdmin,
} from "../../repositories/admin/adminVenueRepository.js";

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

export const updateVenueVisibilityService = async (venueId, venueStatus) => {
  const existingVenue = await getVenueByIdAdmin(venueId);
  if (!existingVenue) {
    throw new Error("Venue not found");
  }
  const venue = await updateVenueVisibilityAdmin(venueId, venueStatus);
  if (!venue) {
    throw new Error("Venue not found");
  }
  return venue;
};
