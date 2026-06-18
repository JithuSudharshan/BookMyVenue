import Venue from '../../models/venue.model.js';

export const createVenue = async (venueData) => {
    const venue = new Venue(venueData);
    return await venue.save();
};

export const findVenueById = async (venueId) => {
    return await Venue.findById(venueId);
};

export const findVenueByVendor = async (venueId, vendorId) => {
    return await Venue.findOne({ _id: venueId, vendorId });
};

export const findVendorVenues = async (vendorId) => {
    return await Venue.find({ vendorId }).sort({ createdAt: -1 });
};

export const updateVenue = async (venueId, updateData) => {
    return await Venue.findByIdAndUpdate(venueId, updateData, { new: true, runValidators: true });
};

export const updateVenueStatus = async (venueId, statusField, newStatus) => {
    const updateQuery = {};
    updateQuery[statusField] = newStatus;
    return await Venue.findByIdAndUpdate(venueId, updateQuery, { new: true, runValidators: true });
};

export const saveDraft = async (venueData) => {
    const venue = new Venue(venueData);
    return await venue.save();
};

export const updateDraft = async (venueId, updateData) => {
    return await Venue.findByIdAndUpdate(venueId, updateData, { new: true, runValidators: true });
};

export const findDrafts = async (vendorId) => {
    return await Venue.find({
        vendorId,
        'approval.status': { $in: ['draft', 'rejected'] }
    }).sort({ updatedAt: -1 });
};
