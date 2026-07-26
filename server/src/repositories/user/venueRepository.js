import Venue from '../../models/venueModel.js';

export const findPublicVenuesAggregation = async ({ matchStage = {}, sortStage = { createdAt: -1 }, skip = 0, limit = 10 }) => {
    // 1. Base match: always only show approved and active venues to users
    const baseMatch = {
        'approval.status': 'approved',
        venueStatus: 'active',
        ...matchStage
    };

    // 2. Build the optimized aggregation pipeline
    const pipeline = [
        { $match: baseMatch },
        { $sort: sortStage },
        {
            $facet: {
                metadata: [{ $count: 'totalCount' }],
                venues: [
                    { $skip: skip },
                    { $limit: limit },
                    // Optimization: Lookups only happen for the paginated documents
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'categoryId',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },
                    {
                        $unwind: {
                            path: '$category',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $addFields: {
                            primaryImage: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: '$images',
                                            as: 'img',
                                            cond: { $eq: ['$$img.isPrimary', true] }
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    },
                    {
                        $addFields: {
                            displayImage: {
                                $ifNull: ['$primaryImage', { $arrayElemAt: ['$images', 0] }]
                            }
                        }
                    },
                    {
                        // Project exactly what frontend expects for the venue listing
                        $project: {
                            _id: 1,
                            name: 1,
                            location: {
                                $concat: ['$location.city', ', ', '$location.state']
                            },
                            price: 1,
                            capacity: 1,
                            bookingModel: 1,
                            category: '$category.name',
                            image: '$displayImage.url',
                            rating: { $ifNull: ['$rating', 0] },
                            reviews: { $ifNull: ['$reviews', 0] }
                        }
                    }
                ]
            }
        }
    ];

    const result = await Venue.aggregate(pipeline);

    // 3. Format output cleanly
    const totalCount = result[0].metadata[0] ? result[0].metadata[0].totalCount : 0;
    const venues = result[0].venues;

    return { totalCount, venues };
};

export const getVenueFilterMetadata = async () => {
    const pipeline = [
        {
            $match: {
                'approval.status': 'approved',
                venueStatus: 'active'
            }
        },
        {
            $group: {
                _id: null,
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                maxCapacity: { $max: '$capacity' },
                amenities: { $addToSet: '$amenities' } // This creates an array of arrays
            }
        },
        {
            $project: {
                _id: 0,
                minPrice: { $ifNull: ['$minPrice', 0] },
                maxPrice: { $ifNull: ['$maxPrice', 5000] },
                maxCapacity: { $ifNull: ['$maxCapacity', 500] },
                // Flatten the array of arrays into a single array of unique amenities
                uniqueAmenities: {
                    $reduce: {
                        input: '$amenities',
                        initialValue: [],
                        in: { $setUnion: ['$$value', '$$this'] }
                    }
                }
            }
        }
    ];

    const result = await Venue.aggregate(pipeline);
    if (result.length > 0) {
        return result[0];
    }
    
    return {
        minPrice: 0,
        maxPrice: 5000,
        maxCapacity: 500,
        uniqueAmenities: []
    };
};
