import Category from "../../models/category.model.js";

export const createCategoryRepository = async (categoryData) => {
    return await Category.create(categoryData);
};

export const getCategoriesRepository = async () => {
    return await Category.aggregate([
        {
            $lookup: {
                from: "subcategories",
                localField: "_id",
                foreignField: "categoryId",
                as: "subcategories"
            }
        },
        {
            $project: {
                name: 1,
                image: 1,
                description: 1,
                isActive: 1,
                createdAt: 1,

                subcategories: {
                    $map: {
                        input: "$subcategories",
                        as: "subcategory",
                        in: {
                            _id: "$$subcategory._id",
                            name: "$$subcategory.name"
                        }
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);
};

export const getCategoryByIdRepository = async (categoryId) => {
    return await Category.findById(categoryId);
};

export const getCategoryByNameRepository = async (name) => {
    return await Category.findOne({ name }).lean();
};