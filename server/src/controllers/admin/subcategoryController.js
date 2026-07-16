import {
    createSubcategoryService,
    getSubcategoriesService,
    updateSubcategoryService,
    toggleSubcategoryStatusService
} from "../../services/admin/subcategoryService.js";



export const createSubcategory = async (req, res) => {
    try {

        const subcategory =
            await createSubcategoryService(
                req.body
            );

        res.status(201).json({
            success: true,
            message:
                "Subcategory created successfully",
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



export const updateSubcategory = async (
    req,
    res
) => {
    try {

        const { subcategoryId } =
            req.params;

        const updatedSubcategory =
            await updateSubcategoryService(
                subcategoryId,
                req.body
            );

        res.status(200).json({
            success: true,
            message:
                "Subcategory updated successfully",
            data: updatedSubcategory
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};



export const toggleSubcategoryStatus =
    async (req, res) => {
        try {

            const { subcategoryId } =
                req.params;

            const { isActive } =
                req.body;

            const subcategory =
                await toggleSubcategoryStatusService(
                    subcategoryId,
                    isActive
                );

            res.status(200).json({
                success: true,
                message: `Subcategory ${
                    isActive
                        ? "activated"
                        : "blocked"
                } successfully`,
                data: subcategory
            });

        } catch (error) {

            res.status(400).json({
                success: false,
                message: error.message
            });

        }
    };