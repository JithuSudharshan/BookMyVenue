import { findPublicVenuesAggregation } from '../../repositories/user/venue.repository.js';

export const getHomeVenuesService = async () => {
    // 1. For the home page, we want 18 most recent venues (3 rows x 6 venues)
    const { venues } = await findPublicVenuesAggregation({
        matchStage: {}, // The repository already filters for approved + active
        sortStage: { createdAt: -1 },
        skip: 0,
        limit: 18
    });

    return venues;
};