import Subcategory from "../../models/subcategory.model.js";

export const createSubcategoryRepository = async (subcategoryData) => {
    return await Subcategory.create(subcategoryData);
};

export const getSubcategoriesRepository = async () => {
    return await Subcategory.find()
        .populate("categoryId", "name")
        .sort({ createdAt: -1 })
        .lean();
};

export const getSubcategoryByNameRepository = async (
    categoryId,
    name
) => {
    return await Subcategory.findOne({
        categoryId,
        name
    });
};

export const getSubcategoriesByCategoryRepository = async (
    categoryId
) => {
    return await Subcategory.find({
        categoryId
    })
        .sort({ name: 1 })
        .lean();
};

export const updateSubcategoryRepository =
    async (
        subcategoryId,
        updateData
    ) => {

        return await Subcategory.findByIdAndUpdate(
            subcategoryId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).lean();
};

export const toggleSubcategoryStatusRepository =
    async (
        subcategoryId,
        isActive
    ) => {

        return await Subcategory.findByIdAndUpdate(
            subcategoryId,
            {
                isActive
            },
            {
                new: true
            }
        ).lean();
};

export const getSubcategoryByIdRepository =
    async (subcategoryId) => {

        return await Subcategory.findById(
            subcategoryId
        ).lean();
};

export const blockAllSubcategoriesByCategoryRepository =
    async (categoryId) => {

        return await Subcategory.updateMany(
            {
                categoryId
            },
            {
                isActive: false
            }
        );
    };