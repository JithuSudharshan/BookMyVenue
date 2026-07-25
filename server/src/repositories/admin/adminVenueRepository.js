import mongoose from 'mongoose';
import Venue from "../../models/venueModel.js";
import Vendor from "../../models/vendorModel.js";
import Slot from "../../models/slotModel.js";
import "../../models/categoryModel.js";
import "../../models/subcategoryModel.js";
export const getAllVenuesAdmin = async ({ search, status, visibility, sort, page = 1, limit = 10 } = {}) => {
  let query = {};
  if (status && status !== 'All') {
    if (status.toLowerCase() === 'under_review') {
      query['approval.status'] = { $in: ['submitted', 'under_review'] };
    } else {
      query['approval.status'] = status.toLowerCase();
    }
  } else {
    query['approval.status'] = { $ne: 'draft' };
  }

  if (visibility && visibility !== 'All') {
    query.venueStatus = visibility.toLowerCase();
    // When filtering by operational status/visibility, we only want to show approved venues
    if (!status || status === 'All') {
      query['approval.status'] = 'approved';
    }
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
  const venue = await Venue.findById(venueId)
    .populate('categoryId', 'name')
    .populate('subcategoryId', 'name')
    .lean();
    
  if (venue) {
    const slots = await Slot.find({ venueId }).lean();
    venue.slots = slots;
    
    // Fetch owner/vendor details
    let vendor = await Vendor.findById(venue.vendorId).lean();
    if (!vendor) {
      vendor = await Vendor.findOne({ userId: venue.vendorId }).lean();
    }
    
    // Also get the user email if we need it
    if (vendor && vendor.userId) {
      const user = await mongoose.model('User').findById(vendor.userId).select('email').lean();
      if (user) vendor.accountEmail = user.email;
    }
    
    venue.vendor = vendor;
  }
  
  return venue;
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
  if (status === 'approved' || status === 'rejected') {
    updateData.venueStatus = 'inactive';
  }
  return await Venue.findByIdAndUpdate(venueId, updateData, { new: true });
};

export const getVendorProfileForVenueAdmin = async (venue) => {
  if (!venue || !venue.vendorId) return null;
  let profile = await Vendor.findById(venue.vendorId);
  if (!profile) {
    profile = await Vendor.findOne({ userId: venue.vendorId });
  }
  return profile;
};

export const updateVenueVisibilityAdmin = async (venueId, venueStatus) => {
  return await Venue.findByIdAndUpdate(venueId, { venueStatus }, { new: true });
};
