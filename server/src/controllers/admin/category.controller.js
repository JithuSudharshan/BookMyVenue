import {
    createCategoryService,
    getCategoriesService
} from "../../services/admin/category.service.js";

export const createCategory = async (req, res) => {
    try {
        const category = await createCategoryService(req.body);

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
        const categories = await getCategoriesService();

        res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};