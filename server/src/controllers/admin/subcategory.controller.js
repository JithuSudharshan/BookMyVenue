import {
    createSubcategoryService,
    getSubcategoriesService
} from "../../services/admin/subcategory.service.js";

export const createSubcategory = async (req, res) => {
    try {
        const subcategory =
            await createSubcategoryService(req.body);

        res.status(201).json({
            success: true,
            message: "Subcategory created successfully",
            data: subcategory
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getSubcategories = async (req, res) => {
    try {
        const subcategories =
            await getSubcategoriesService();

        res.status(200).json({
            success: true,
            data: subcategories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};