import { getVenuesService } from "../../services/user/venuesService.js";

export const LoadVenues = async (req, res) => {
    try {
        const { venues, pagination, availableCategories, filterMetadata } = await getVenuesService(req.query);

        res.status(200).json({
            success: true,
            message: "Venues retrieved successfully",
            data: {
                venues,
                pagination,
                availableCategories,
                filterMetadata
            }
        });

    } catch (error) {
        console.error("Error in LoadVenues controller:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};