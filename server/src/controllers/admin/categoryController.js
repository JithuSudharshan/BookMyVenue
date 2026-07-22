import {
    createCategoryService,
    getCategoriesService,
    updateCategoryService,
    toggleCategoryStatusService
} from "../../services/admin/categoryService.js";



export const createCategory = async (req, res) => {
    try {
        const categoryData = { ...req.body };
        const category =
            await createCategoryService(categoryData, req.file);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};



export const getCategories = async (req, res) => {
    try {

        const result =
            await getCategoriesService(req.query);

        res.status(200).json({
            success: true,
            message:
                "Categories fetched successfully",
            data: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};



export const updateCategory = async (req, res) => {
    try {

        const { categoryId } = req.params;
        const updateData = { ...req.body };
        const updatedCategory =
            await updateCategoryService(
                categoryId,
                updateData,
                req.file
            );

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};



export const toggleCategoryStatus = async (req, res) => {
    try {

        const { categoryId } = req.params;

        const { isActive } = req.body;

        const category =
            await toggleCategoryStatusService(
                categoryId,
                isActive
            );

        res.status(200).json({
            success: true,
            message: `Category ${
                isActive
                    ? "published"
                    : "unpublished"
            } successfully`,
            data: category
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};