import Venue from '../../models/venue.model.js';

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
                            amenities: 1,
                            category: '$category.name',
                            image: '$displayImage.url'
                            // rating is skipped for now as per requirements
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
