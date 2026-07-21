import { findPublicVenuesAggregation } from '../../repositories/user/venueRepository.js';
import Category from '../../models/categoryModel.js';

export const getHomeVenuesService = async () => {
    // 1. Fetch the latest 18 approved+active venues for the home grid
    const { venues, totalCount } = await findPublicVenuesAggregation({
        matchStage: {},
        sortStage: { createdAt: -1 },
        skip: 0,
        limit: 18
    });

    // 2. Fetch all published categories for the category strip
    const categories = await Category.find({ isActive: true })
        .select('name image')
        .sort({ createdAt: 1 })
        .lean();

    // 3. Return combined home data
    return {
        venues,
        categories,
        stats: {
            totalVenues: totalCount
        }
    };
};
