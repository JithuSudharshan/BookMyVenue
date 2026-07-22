import {
    createSubcategoryService,
    updateSubcategoryService,
    toggleSubcategoryStatusService,
    deleteSubcategoryService
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
                message: `Subcategory ${isActive
                        ? "published"
                        : "unpublished"
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


export const deleteSubcategory = async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        await deleteSubcategoryService(subcategoryId);
        res.status(200).json({ success: true, message: "Subcategory deleted successfully" });
    } catch (error) {
        // 409 for FK guard, 400 for other errors
        const status = error.message.includes('Cannot delete') ? 409 : 400;
        res.status(status).json({ success: false, message: error.message });
    }
};