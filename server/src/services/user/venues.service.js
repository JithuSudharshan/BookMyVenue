import { findPublicVenuesAggregation } from '../../repositories/user/venue.repository.js';
import Category from '../../models/category.model.js';

export const getVenuesService = async (queryParams) => {
    const {
        location,
        guests,
        category,
        priceMin,
        priceMax,
        capacity, // range like '200-500' or '500+'
        amenities,
        sort,
        page = 1,
        limit = 10
    } = queryParams;

    const matchStage = {};

    // 1. Search filters (Location)
    if (location) {
        const locationRegex = { $regex: location, $options: 'i' };
        matchStage.$or = [
            { 'location.city': locationRegex },
            { 'location.state': locationRegex },
            { 'location.address': locationRegex }
        ];
    }

    // 2. Category Filter (Need to resolve name to ID first)
    if (category && category !== 'All') {
        const categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
        if (categoryDoc) {
            matchStage.categoryId = categoryDoc._id;
        } else {
            // If category not found, return empty results by matching an impossible condition
            matchStage.categoryId = null;
        }
    }

    // 3. Guests Filter (Minimum Capacity required)
    if (guests) {
        matchStage.capacity = { ...matchStage.capacity, $gte: Number(guests) };
    }

    // 4. Capacity Range Filter (from chips)
    if (capacity) {
        if (capacity.includes('+')) {
            const min = parseInt(capacity.replace('+', ''), 10);
            matchStage.capacity = { ...matchStage.capacity, $gte: min };
        } else if (capacity.includes('-')) {
            const [min, max] = capacity.split('-').map(Number);
            matchStage.capacity = { ...matchStage.capacity, $gte: min, $lte: max };
        }
    }

    // 5. Price Filters
    if (priceMin !== undefined || priceMax !== undefined) {
        matchStage.price = {};
        if (priceMin !== undefined) matchStage.price.$gte = Number(priceMin);
        if (priceMax !== undefined) matchStage.price.$lte = Number(priceMax);
    }

    // 6. Amenities Filter
    if (amenities) {
        const amenitiesArray = amenities.split(',').map(a => a.trim());
        matchStage.amenities = { $all: amenitiesArray };
    }

    // 7. Sorting
    let sortStage = { createdAt: -1 }; // Default: Newest first (Recommended)
    if (sort === 'price_asc') sortStage = { price: 1 };
    else if (sort === 'price_desc') sortStage = { price: -1 };
    // rating skipped for now as per requirements

    // 8. Pagination math
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    // 9. Execute Repository Query
    const { totalCount, venues } = await findPublicVenuesAggregation({
        matchStage,
        sortStage,
        skip,
        limit: parsedLimit
    });

    // 10. Compute Pagination Metadata
    const totalPages = Math.ceil(totalCount / parsedLimit);
    
    const pagination = {
        totalVenues: totalCount,
        totalPages,
        currentPage: parsedPage,
        hasNextPage: parsedPage < totalPages,
        hasPrevPage: parsedPage > 1
    };

    return { venues, pagination };
};