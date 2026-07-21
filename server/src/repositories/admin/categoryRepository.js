import Category from "../../models/categoryModel.js";

export const createCategoryRepository = async (categoryData) => {
    return await Category.create(categoryData);
};


export const getCategoriesRepository = async ({
    search,
    status,
    sort,
    skip,
    limit
}) => {

    const matchStage = {};

    if (status === "active") matchStage.isActive = true;
    else if (status === "inactive") matchStage.isActive = false;

    const pipeline = [
        {
            $lookup: {
                from: "subcategories",
                localField: "_id",
                foreignField: "categoryId",
                as: "subcategories"
            }
        }
    ];

    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    {
                        name: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        "subcategories.name": {
                            $regex: search,
                            $options: "i"
                        }
                    }
                ]
            }
        });
    }

    if (Object.keys(matchStage).length) {
        pipeline.push({
            $match: matchStage
        });
    }

    pipeline.push(
        {
            $project: {
                name: 1,
                image: 1,
                isActive: 1,
                createdAt: 1,
                subcategories: {
                    $map: {
                        input: "$subcategories",
                        as: "subcategory",
                        in: {
                            _id: "$$subcategory._id",
                            name: "$$subcategory.name",
                            isActive: "$$subcategory.isActive"
                        }
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: sort === "oldest" ? 1 : -1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        }
    );

    return await Category.aggregate(pipeline);
};


export const getCategoriesCountRepository = async ({
    search,
    status
}) => {

    const match = {};

    if (status === "active") match.isActive = true;
    else if (status === "inactive") match.isActive = false;

    const pipeline = [
        {
            $lookup: {
                from: "subcategories",
                localField: "_id",
                foreignField: "categoryId",
                as: "subcategories"
            }
        }
    ];

    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    {
                        name: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        "subcategories.name": {
                            $regex: search,
                            $options: "i"
                        }
                    }
                ]
            }
        });
    }

    if (Object.keys(match).length) {
        pipeline.push({
            $match: match
        });
    }

    pipeline.push({
        $count: "total"
    });

    const result = await Category.aggregate(pipeline);

    return result[0]?.total || 0;
};


export const getCategoryByIdRepository = async (categoryId) => {
    return await Category.findById(categoryId);
};

export const getCategoryByNameRepository = async (name) => {
    return await Category.findOne({ name }).lean();
};

export const updateCategoryRepository = async (
    categoryId,
    updateData
) => {
    return await Category.findByIdAndUpdate(
        categoryId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    ).lean();
};

export const toggleCategoryStatusRepository =
    async (
        categoryId,
        isActive
    ) => {

        return await Category.findByIdAndUpdate(
            categoryId,
            {
                isActive
            },
            {
                new: true
            }
        ).lean();
};