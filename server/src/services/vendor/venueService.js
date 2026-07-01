import * as venueRepository from '../../repositories/vendor/venueRepository.js';
import Category from '../../models/categoryModel.js';
import Subcategory from '../../models/subcategoryModel.js';
import Venue from '../../models/venueModel.js';
import { generateSlug } from '../../utils/generateSlug.js';
import ApiError from '../../utils/ApiError.js';

const validateTimeRange = (opening, closing) => {
    const openDate = new Date(`1970-01-01T${opening}:00Z`);
    const closeDate = new Date(`1970-01-01T${closing}:00Z`);
    return openDate < closeDate;
};

// Complex business validation (Mongoose handles basics like required, min, max, trim conditionally)
export const validateVenueBusinessRules = async (venueData) => {
    const { categoryId, subcategoryId, bookingModel, bookingConfig } = venueData;

    if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) throw new ApiError(400, "Category does not exist");

        if (subcategoryId) {
            const subcategory = await Subcategory.findById(subcategoryId);
            if (!subcategory) throw new ApiError(400, "Subcategory does not exist");
            if (subcategory.categoryId.toString() !== categoryId.toString()) {
                throw new ApiError(400, "Subcategory must belong to selected category");
            }
        }
    }

    if (bookingModel === 'hourly') {
        if (bookingConfig && bookingConfig.openingTime && bookingConfig.closingTime) {
            if (!validateTimeRange(bookingConfig.openingTime, bookingConfig.closingTime)) {
                throw new ApiError(400, "Invalid time range. Closing time must be after opening time.");
            }
        }
    }
};

// --- DRAFT LOGIC ---

export const saveDraft = async (vendorId, venueId, venueData) => {
    if (!vendorId) throw new ApiError(401, "Unauthorized");

    let venue;
    if (venueId) {
        venue = await venueRepository.findVenueById(venueId);
        if (!venue) throw new ApiError(404, "Draft not found");
        if (venue.vendorId.toString() !== vendorId.toString()) throw new ApiError(403, "Forbidden");

        if (venue.approval.status !== 'draft' && venue.approval.status !== 'rejected') {
            throw new ApiError(400, "Venue is already submitted or approved and cannot be saved as a draft");
        }
    }

    if (venueData.name && venueData.name.trim() !== "") {
        const slug = generateSlug(venueData.name);
        if (slug && (!venue || slug !== venue.slug)) {
            const query = { slug };
            if (venueId) query._id = { $ne: venueId };
            const existingVenue = await Venue.findOne(query);
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

    await validateVenueBusinessRules(venueData);

    if (venueId) {
        venue.set(venueData);
        return await venue.save();
    } else {
        venueData.vendorId = vendorId;
        venueData.approval = { status: 'draft' };
        venueData.venueStatus = 'inactive';
        return await venueRepository.saveDraft(venueData);
    }
};

export const getDrafts = async (vendorId) => {
    return await venueRepository.findVendorVenuesSSFP({
        vendorId,
        approvalStatus: ['draft', 'rejected']
    });
};

export const continueDraft = async (vendorId, venueId) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Draft not found");
    if (venue.vendorId.toString() !== vendorId.toString()) throw new ApiError(403, "Forbidden");

    if (venue.approval.status !== 'draft' && venue.approval.status !== 'rejected') {
        throw new ApiError(400, "This venue is not a draft");
    }

    return venue;
};

// --- SUBMISSION LOGIC ---

export const submitVenueService = async (vendorId, venueId) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Venue not found");
    if (venue.vendorId.toString() !== vendorId.toString()) throw new ApiError(403, "Forbidden");

    if (venue.approval.status !== 'draft' && venue.approval.status !== 'rejected') {
        throw new ApiError(400, "Only drafts or rejected venues can be submitted");
    }

    // Set approval status to trigger strict Mongoose validation on save()
    venue.approval.status = 'submitted';
    venue.approval.submittedAt = new Date();
    
    // Using .save() triggers Mongoose's full document validation (which now uses isStrict())
    return await venue.save();
};

export const createVenueService = async (vendorId, venueData) => {
    if (!vendorId) throw new ApiError(401, "Unauthorized");

    await validateVenueBusinessRules(venueData);

    if (venueData.name) {
        const slug = generateSlug(venueData.name);
        const existingVenue = await Venue.findOne({ slug });
        if (existingVenue) throw new ApiError(400, "A venue with this name already exists");
        venueData.slug = slug;
    }

    venueData.vendorId = vendorId;
    venueData.approval = { 
        status: 'submitted',
        submittedAt: new Date()
    };
    venueData.venueStatus = 'inactive';

    return await venueRepository.createVenue(venueData);
};

export const updateVenueService = async (vendorId, venueId, updateData) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Venue not found");
    if (venue.vendorId.toString() !== vendorId.toString()) throw new ApiError(403, "Forbidden");

    // Protect core status fields from generic updates
    delete updateData.approval;
    delete updateData.venueStatus;

    if (updateData.name) {
        const slug = generateSlug(updateData.name);
        if (slug !== venue.slug) {
            const existingVenue = await Venue.findOne({ slug, _id: { $ne: venueId } });
            if (existingVenue) throw new ApiError(400, "A venue with this name already exists");
            updateData.slug = slug;
        }
    }

    await validateVenueBusinessRules(updateData);

    venue.set(updateData);
    return await venue.save();
};

export const getVenueByIdService = async (vendorId, venueId) => {
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new ApiError(404, "Venue not found");
    if (venue.vendorId.toString() !== vendorId.toString()) throw new ApiError(403, "Forbidden");
    return venue;
};

export const getVendorVenuesService = async (vendorId, queryParams = {}) => {
    // 1. Extract params
    const search = queryParams.search ? queryParams.search.trim() : null;
    const venueStatus = queryParams.venueStatus || null;
    const bookingModel = queryParams.bookingModel || null;
    let approvalStatus = queryParams.approvalStatus || null;
    const sort = queryParams.sort || 'new'; // 'new', 'old', 'price_low', 'price_high'
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 6;

    // 2. Validate and Default
    let sortField = 'updatedAt';
    let sortOrder = -1;

    switch (sort) {
        case 'old':
            sortField = 'updatedAt';
            sortOrder = 1;
            break;
        case 'price_low':
            sortField = 'price';
            sortOrder = 1;
            break;
        case 'price_high':
            sortField = 'price';
            sortOrder = -1;
            break;
        case 'new':
        default:
            sortField = 'updatedAt';
            sortOrder = -1;
            break;
    }

    const skip = Math.max(0, (page - 1) * limit);
    const validLimit = Math.max(1, Math.min(limit, 50)); // Cap at 50

    // Default to 'approved' if no tab is selected on opening page
    if (!approvalStatus && !queryParams.status) {
        approvalStatus = 'approved';
    }

    // Compatibility for old `?status=draft` query
    if (queryParams.status === 'draft') {
        approvalStatus = ['draft', 'rejected'];
    }

    // 3. Call Repository
    return await venueRepository.findVendorVenuesSSFP({
        vendorId,
        search,
        venueStatus,
        bookingModel,
        approvalStatus,
        sortField,
        sortOrder,
        skip,
        limit: validLimit
    });
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
