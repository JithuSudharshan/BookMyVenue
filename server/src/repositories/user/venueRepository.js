import Venue from '../../models/venueModel.js';
import { getCityCoordinates, calculateHaversineDistance } from '../../utils/geoUtils.js';

export const findPublicVenuesAggregation = async ({
    matchStage = {},
    sortStage = { createdAt: -1 },
    skip = 0,
    limit = 10,
    targetLat = null,
    targetLng = null,
    maxRadiusKm = 50
}) => {
    // 1. Base match: always only show approved and active venues to users
    const baseMatch = {
        'approval.status': 'approved',
        venueStatus: 'active',
        ...matchStage
    };

    // 2. If target coordinates are provided, compute Haversine distance and filter within default radius (50 km)
    if (targetLat !== null && targetLng !== null && !isNaN(targetLat) && !isNaN(targetLng)) {
        const geoPipeline = [
            { $match: baseMatch },
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
                $project: {
                    _id: 1,
                    name: 1,
                    locationCity: '$location.city',
                    locationState: '$location.state',
                    location: {
                        $concat: ['$location.city', ', ', '$location.state']
                    },
                    price: 1,
                    capacity: 1,
                    bookingModel: 1,
                    category: '$category.name',
                    image: '$displayImage.url',
                    rating: { $ifNull: ['$rating', 0] },
                    reviews: { $ifNull: ['$reviews', 0] },
                    createdAt: 1
                }
            }
        ];

        const allMatchedVenues = await Venue.aggregate(geoPipeline);

        const venuesWithDistance = [];
        for (const venue of allMatchedVenues) {
            const coords = getCityCoordinates(venue.locationCity) || getCityCoordinates(venue.locationState);
            const dist = calculateHaversineDistance(targetLat, targetLng, coords?.lat, coords?.lng);
            if (dist !== null && dist <= maxRadiusKm) {
                venuesWithDistance.push({
                    ...venue,
                    distanceKm: dist
                });
            }
        }

        if (sortStage.distanceKm || sortStage.distance) {
            venuesWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
        } else if (sortStage.price === 1) {
            venuesWithDistance.sort((a, b) => a.price - b.price);
        } else if (sortStage.price === -1) {
            venuesWithDistance.sort((a, b) => b.price - a.price);
        } else {
            venuesWithDistance.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const totalCount = venuesWithDistance.length;
        const paginatedVenues = venuesWithDistance.slice(skip, skip + limit);

        return { totalCount, venues: paginatedVenues };
    }

    // 3. Build the optimized aggregation pipeline for standard queries
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
