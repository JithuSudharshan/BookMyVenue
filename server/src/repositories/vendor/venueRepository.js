import mongoose from 'mongoose';
import Venue from '../../models/venueModel.js';

export const createVenue = async (venueData) => {
    const venue = new Venue(venueData);
    return await venue.save();
};

export const findVenueById = async (venueId) => {
    return await Venue.findById(venueId);
};

export const findVenueByVendor = async (venueId, vendorId) => {
    return await Venue.findOne({ _id: venueId, vendorId });
};

export const findVendorVenuesSSFP = async ({
    vendorId,
    search,
    venueStatus,
    bookingModel,
    approvalStatus,
    sortField = 'updatedAt',
    sortOrder = -1,
    skip = 0,
    limit = 6
}) => {
    // 1. Build dynamic match stage
    const matchStage = { vendorId: new mongoose.Types.ObjectId(vendorId) };

    if (search) {
        matchStage.name = { $regex: search, $options: 'i' };
    }

    if (venueStatus) {
        matchStage.venueStatus = venueStatus;
    }

    if (bookingModel) {
        matchStage.bookingModel = bookingModel;
    }

    if (approvalStatus) {
        if (Array.isArray(approvalStatus)) {
            matchStage['approval.status'] = { $in: approvalStatus };
        } else {
            matchStage['approval.status'] = approvalStatus;
        }
    }

    // 2. Build highly optimized aggregation pipeline
    const pipeline = [
        { $match: matchStage },
        { $sort: { [sortField]: sortOrder } },
        {
            $facet: {
                metadata: [{ $count: 'totalCount' }],
                venues: [
                    { $skip: skip },
                    { $limit: limit },
                    // Optimization: Lookups only happen for the 6 paginated documents, not the whole collection
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
                        $lookup: {
                            from: 'subcategories',
                            localField: 'subcategoryId',
                            foreignField: '_id',
                            as: 'subcategory'
                        }
                    },
                    {
                        $unwind: {
                            path: '$subcategory',
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
                            name: 1,
                            slug: 1,
                            'location.city': 1,
                            price: 1,
                            capacity: 1,
                            bookingModel: 1,
                            approval: 1,
                            venueStatus: 1,
                            updatedAt: 1,
                            categoryName: '$category.name',
                            subcategoryName: '$subcategory.name',
                            image: '$displayImage.url'
                        }
                    }
                ]
            }
        }
    ];

    const result = await Venue.aggregate(pipeline);

    // Format output cleanly
    const totalCount = result[0].metadata[0] ? result[0].metadata[0].totalCount : 0;
    const venues = result[0].venues;

    return { totalCount, venues };
};

export const updateVenue = async (venueId, updateData) => {
    return await Venue.findByIdAndUpdate(venueId, updateData, { new: true, runValidators: true });
};

export const updateVenueStatus = async (venueId, statusField, newStatus) => {
    const updateQuery = {};
    updateQuery[statusField] = newStatus;
    return await Venue.findByIdAndUpdate(venueId, updateQuery, { new: true, runValidators: true });
};

export const saveDraft = async (venueData) => {
    const venue = new Venue(venueData);
    return await venue.save();
};

export const updateDraft = async (venueId, updateData) => {
    return await Venue.findByIdAndUpdate(venueId, updateData, { new: true, runValidators: true });
};
