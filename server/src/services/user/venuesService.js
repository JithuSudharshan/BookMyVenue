import { findPublicVenuesAggregation, getVenueFilterMetadata } from '../../repositories/user/venueRepository.js';
import Category from '../../models/categoryModel.js';
import Subcategory from '../../models/subcategoryModel.js';
import { getCityCoordinates } from '../../utils/geoUtils.js';

export const getVenuesService = async (queryParams) => {
    const {
        location,
        lat,
        lng,
        radius,
        guests,
        category,
        subcategory,
        priceMin,
        priceMax,
        capacity, // range like '200-500' or '500+'
        amenities,
        sort,
        page = 1,
        limit = 10
    } = queryParams;

    const matchStage = {};

    // 1. Search filters (Location text & coordinate resolution)
    let targetLat = null;
    let targetLng = null;
    const maxRadiusKm = Number(radius) || 50; // Default 50 km search radius

    if (lat !== undefined && lng !== undefined && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
        targetLat = Number(lat);
        targetLng = Number(lng);
    } else if (location) {
        const coords = getCityCoordinates(location);
        if (coords) {
            targetLat = coords.lat;
            targetLng = coords.lng;
        }
    }

    if (location && targetLat === null && targetLng === null) {
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

    // 2.5 Subcategory Filter (Need to resolve name to ID first)
    if (subcategory) {
        const subcategoryDoc = await Subcategory.findOne({ name: { $regex: new RegExp(`^${subcategory}$`, 'i') } });
        if (subcategoryDoc) {
            matchStage.subcategoryId = subcategoryDoc._id;
        } else {
            matchStage.subcategoryId = null;
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
    else if (sort === 'distance_asc' || sort === 'distance') sortStage = { distanceKm: 1 };
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
        limit: parsedLimit,
        targetLat,
        targetLng,
        maxRadiusKm
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
    // 10. Fetch Available Categories for Frontend Filter
    const availableCategories = await Category.find({ isActive: true }).select('_id name').lean();
    const activeSubcategories = await Subcategory.find({ isActive: true }).select('categoryId name').lean();

    // Format categories nicely for the frontend
    const formattedCategories = availableCategories.map(c => ({
        name: c.name,
        subcategories: activeSubcategories
            .filter(sub => sub.categoryId.toString() === c._id.toString())
            .map(sub => sub.name)
    }));

    // 11. Fetch Filter Metadata (max price, unique amenities, etc)
    const filterMetadata = await getVenueFilterMetadata();

    return { 
        venues, 
        pagination, 
        availableCategories: formattedCategories,
        filterMetadata 
    };
};
