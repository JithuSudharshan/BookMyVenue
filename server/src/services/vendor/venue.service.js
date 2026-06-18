import * as venueRepository from '../../repositories/venue.repository.js';
import Category from '../../models/category.model.js';
import Subcategory from '../../models/subcategory.model.js';
import Venue from '../../models/venue.model.js'; 
import { generateSlug } from '../../utils/generateSlug.js';
import ApiError from '../../utils/ApiError.js';
import { BOOKING_MODELS } from '../../utils/venue.constants.js';

// Helper for time validation (expects HH:mm format)
const validateTimeRange = (opening, closing) => {
    const openDate = new Date(`1970-01-01T${opening}:00Z`);
    const closeDate = new Date(`1970-01-01T${closing}:00Z`);
    return openDate < closeDate;
};

export const createVenueService = async (vendorId, venueData) => {
    if (!vendorId) throw new ApiError(401, "Unauthorized");

    const { name, price, capacity, categoryId, subcategoryId, bookingModel, bookingConfig } = venueData;

    // Basic Validations
    if (!name || name.trim() === "") throw new ApiError(400, "Name cannot be empty");
    if (price < 0) throw new ApiError(400, "Price cannot be negative");
    if (capacity <= 0) throw new ApiError(400, "Capacity must be greater than 0");

    // Category Validations
    const category = await Category.findById(categoryId);
    if (!category) throw new ApiError(400, "Category does not exist");

    if (subcategoryId) {
        const subcategory = await Subcategory.findById(subcategoryId);
        if (!subcategory) throw new ApiError(400, "Subcategory does not exist");
        if (subcategory.categoryId.toString() !== categoryId.toString()) {
            throw new ApiError(400, "Subcategory must belong to selected category");
        }
    }

    // Booking Model Validations
    if (!BOOKING_MODELS.includes(bookingModel)) {
        throw new ApiError(400, "Invalid Booking Model");
    }

    if (bookingModel === 'hourly') {
        if (!bookingConfig || !bookingConfig.openingTime || !bookingConfig.closingTime) {
            throw new ApiError(400, "Opening and closing time required for hourly model");
        }
        if (!validateTimeRange(bookingConfig.openingTime, bookingConfig.closingTime)) {
            throw new ApiError(400, "Invalid time range. Closing time must be after opening time.");
        }
    }

    // Duplicate Name validation
    const slug = generateSlug(name);
    const existingVenue = await Venue.findOne({ slug });
    if (existingVenue) {
        throw new ApiError(400, "A venue with this name already exists");
    }

    venueData.slug = slug;
    venueData.vendorId = vendorId;
    
    // Business rules: new venues start as drafts and inactive
    if (!venueData.approval) venueData.approval = {};
    venueData.approval.status = 'draft'; 
    venueData.venueStatus = 'inactive';

    return await venueRepository.createVenue(venueData);
};

export const getVenueByIdService = async (vendorId, venueId) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Venue not found");
    if (venue.vendorId.toString() !== vendorId.toString()) {
        throw new ApiError(403, "Forbidden");
    }
    return venue;
};

export const getVendorVenuesService = async (vendorId) => {
    return await venueRepository.findVendorVenues(vendorId);
};

export const updateVenueService = async (vendorId, venueId, updateData) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Venue not found");
    if (venue.vendorId.toString() !== vendorId.toString()) {
        throw new ApiError(403, "Forbidden");
    }

    // Business Rule: Updating an approved venue sets it back to submitted
    if (venue.approval.status === 'approved') {
        if (!updateData.approval) updateData.approval = {};
        updateData.approval.status = 'submitted';
    }

    // Disallow overriding critical states maliciously
    delete updateData.venueStatus;
    
    // Validate time if hourly
    const currentModel = updateData.bookingModel || venue.bookingModel;
    if (currentModel === 'hourly') {
        const opening = updateData.bookingConfig?.openingTime || venue.bookingConfig?.openingTime;
        const closing = updateData.bookingConfig?.closingTime || venue.bookingConfig?.closingTime;
        
        if (!opening || !closing) {
             throw new ApiError(400, "Opening and closing time required for hourly model");
        }
        if (!validateTimeRange(opening, closing)) {
            throw new ApiError(400, "Invalid time range. Closing time must be after opening time.");
        }
    }

    // Re-generate slug if name changed
    if (updateData.name) {
        const slug = generateSlug(updateData.name);
        if (slug !== venue.slug) {
            const existingVenue = await Venue.findOne({ slug, _id: { $ne: venueId } });
            if (existingVenue) {
                throw new ApiError(400, "A venue with this name already exists");
            }
            updateData.slug = slug;
        }
    }

    return await venueRepository.updateVenue(venueId, updateData);
};

export const blockVenueService = async (vendorId, venueId) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Venue not found");
    if (venue.vendorId.toString() !== vendorId.toString()) {
        throw new ApiError(403, "Forbidden");
    }

    if (venue.venueStatus === 'inactive') {
        throw new ApiError(409, "Venue already blocked");
    }

    return await venueRepository.updateVenueStatus(venueId, 'venueStatus', 'inactive');
};

export const unblockVenueService = async (vendorId, venueId) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Venue not found");
    if (venue.vendorId.toString() !== vendorId.toString()) {
        throw new ApiError(403, "Forbidden");
    }

    if (venue.venueStatus === 'active') {
        throw new ApiError(409, "Venue already active");
    }

    if (venue.approval.status !== 'approved') {
        throw new ApiError(400, "Cannot activate unapproved venue");
    }

    return await venueRepository.updateVenueStatus(venueId, 'venueStatus', 'active');
};
