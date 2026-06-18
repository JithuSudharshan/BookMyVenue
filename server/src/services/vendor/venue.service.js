import * as venueRepository from '../../repositories/vendor/venue.repository.js';
import Category from '../../models/category.model.js';
import Subcategory from '../../models/subcategory.model.js';
import Venue from '../../models/venue.model.js';
import { generateSlug } from '../../utils/generateSlug.js';
import ApiError from '../../utils/ApiError.js';
import { BOOKING_MODELS } from '../../utils/venue.constants.js';

const validateTimeRange = (opening, closing) => {
    const openDate = new Date(`1970-01-01T${opening}:00Z`);
    const closeDate = new Date(`1970-01-01T${closing}:00Z`);
    return openDate < closeDate;
};

// Strict validation for submission
export const validateVenueSubmission = async (venueData) => {
    const { name, price, capacity, categoryId, subcategoryId, bookingModel, bookingConfig, location, description, images } = venueData;

    if (!name || name.trim() === "") throw new ApiError(400, "Name cannot be empty");
    if (!description || description.trim() === "") throw new ApiError(400, "Description is required");
    
    if (price === undefined || price === null || price < 0) throw new ApiError(400, "Valid price is required");
    if (capacity === undefined || capacity === null || capacity <= 0) throw new ApiError(400, "Valid capacity is required");

    if (!location || !location.address || !location.city || !location.state || !location.pincode) {
        throw new ApiError(400, "Complete location information is required");
    }

    if (!images || images.length === 0) {
        throw new ApiError(400, "At least one image is required for submission");
    }

    if (!categoryId) throw new ApiError(400, "Category is required");
    const category = await Category.findById(categoryId);
    if (!category) throw new ApiError(400, "Category does not exist");

    if (!subcategoryId) throw new ApiError(400, "Subcategory is required");
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) throw new ApiError(400, "Subcategory does not exist");
    if (subcategory.categoryId.toString() !== categoryId.toString()) {
        throw new ApiError(400, "Subcategory must belong to selected category");
    }

    if (!bookingModel || !BOOKING_MODELS.includes(bookingModel)) {
        throw new ApiError(400, "Valid Booking Model is required");
    }

    if (bookingModel === 'hourly') {
        if (!bookingConfig || !bookingConfig.openingTime || !bookingConfig.closingTime) {
            throw new ApiError(400, "Opening and closing time required for hourly model");
        }
        if (!validateTimeRange(bookingConfig.openingTime, bookingConfig.closingTime)) {
            throw new ApiError(400, "Invalid time range. Closing time must be after opening time.");
        }
    }
};

// --- DRAFT LOGIC ---

export const saveDraft = async (vendorId, venueId, venueData) => {
    if (!vendorId) throw new ApiError(401, "Unauthorized");

    if (venueId) {
        const venue = await venueRepository.findVenueById(venueId);
        if (!venue) throw new ApiError(404, "Draft not found");
        if (venue.vendorId.toString() !== vendorId.toString()) throw new ApiError(403, "Forbidden");

        if (venue.approval.status !== 'draft' && venue.approval.status !== 'rejected') {
            throw new ApiError(400, "Venue is already submitted or approved and cannot be saved as a draft");
        }

        if (venueData.name && venueData.name.trim() !== "") {
            const slug = generateSlug(venueData.name);
            if (slug && slug !== venue.slug) {
                const existingVenue = await Venue.findOne({ slug, _id: { $ne: venueId } });
                if (existingVenue) throw new ApiError(400, "A venue with this name already exists");
                venueData.slug = slug;
            } else if (!slug) {
                venueData.slug = undefined;
            }
        } else if (venueData.name === "") {
            venueData.slug = undefined;
        }

        delete venueData.approval;
        delete venueData.venueStatus;

        return await venueRepository.updateDraft(venueId, venueData);
    } else {
        if (venueData.name && venueData.name.trim() !== "") {
            const slug = generateSlug(venueData.name);
            if (slug) {
                const existingVenue = await Venue.findOne({ slug });
                if (existingVenue) {
                    throw new ApiError(400, "A venue with this name already exists");
                }
                venueData.slug = slug;
            } else {
                venueData.slug = undefined;
            }
        } else {
            venueData.slug = undefined;
        }

        venueData.vendorId = vendorId;
        
        if (!venueData.approval) venueData.approval = {};
        venueData.approval.status = 'draft';
        venueData.venueStatus = 'inactive';

        return await venueRepository.saveDraft(venueData);
    }
};

export const getDrafts = async (vendorId) => {
    return await venueRepository.findDrafts(vendorId);
};

export const continueDraft = async (vendorId, venueId) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Draft not found");
    if (venue.vendorId.toString() !== vendorId.toString()) throw new ApiError(403, "Forbidden");

    // Only allow continuing if it is a draft or rejected
    if (venue.approval.status !== 'draft' && venue.approval.status !== 'rejected') {
        throw new ApiError(400, "This venue is not a draft");
    }

    return venue;
};

// --- SUBMISSION LOGIC ---

export const createVenueService = async (vendorId, venueData) => {
    if (!vendorId) throw new ApiError(401, "Unauthorized");

    await validateVenueSubmission(venueData);

    const slug = generateSlug(venueData.name);
    const existingVenue = await Venue.findOne({ slug });
    if (existingVenue) throw new ApiError(400, "A venue with this name already exists");

    venueData.slug = slug;
    venueData.vendorId = vendorId;
    
    if (!venueData.approval) venueData.approval = {};
    venueData.approval.status = 'submitted';
    venueData.venueStatus = 'inactive';

    return await venueRepository.createVenue(venueData);
};

export const updateVenueService = async (vendorId, venueId, updateData) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Venue not found");
    if (venue.vendorId.toString() !== vendorId.toString()) throw new ApiError(403, "Forbidden");

    // Merge deeply for nested objects to validate full submission state
    const mergedData = { ...venue.toObject(), ...updateData };
    if (updateData.location && venue.location) {
        mergedData.location = { ...venue.location, ...updateData.location };
    }
    if (updateData.bookingConfig && venue.bookingConfig) {
        mergedData.bookingConfig = { ...venue.bookingConfig, ...updateData.bookingConfig };
    }

    await validateVenueSubmission(mergedData);

    if (!updateData.approval) updateData.approval = {};
    updateData.approval.status = 'submitted';

    delete updateData.venueStatus;

    if (updateData.name) {
        const slug = generateSlug(updateData.name);
        if (slug && slug !== venue.slug) {
            const existingVenue = await Venue.findOne({ slug, _id: { $ne: venueId } });
            if (existingVenue) throw new ApiError(400, "A venue with this name already exists");
            updateData.slug = slug;
        }
    }

    return await venueRepository.updateVenue(venueId, updateData);
};

export const getVenueByIdService = async (vendorId, venueId) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Venue not found");
    if (venue.vendorId.toString() !== vendorId.toString()) throw new ApiError(403, "Forbidden");
    return venue;
};

export const getVendorVenuesService = async (vendorId, queryParams = {}) => {
    if (queryParams.status === 'draft') {
        return await getDrafts(vendorId);
    }
    return await venueRepository.findVendorVenues(vendorId);
};

export const blockVenueService = async (vendorId, venueId) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Venue not found");
    if (venue.vendorId.toString() !== vendorId.toString()) throw new ApiError(403, "Forbidden");

    if (venue.venueStatus === 'inactive') throw new ApiError(409, "Venue already blocked");

    return await venueRepository.updateVenueStatus(venueId, 'venueStatus', 'inactive');
};

export const unblockVenueService = async (vendorId, venueId) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Venue not found");
    if (venue.vendorId.toString() !== vendorId.toString()) throw new ApiError(403, "Forbidden");

    if (venue.venueStatus === 'active') throw new ApiError(409, "Venue already active");
    if (venue.approval.status !== 'approved') throw new ApiError(400, "Cannot activate unapproved venue");

    return await venueRepository.updateVenueStatus(venueId, 'venueStatus', 'active');
};
