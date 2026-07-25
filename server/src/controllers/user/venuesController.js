import { getVenuesService } from "../../services/user/venuesService.js";
import { findOverridesByVenueAndMonth } from "../../repositories/vendor/slotOverrideRepository.js";

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

export const getPublicSlotOverview = async (req, res) => {
    try {
        const { id } = req.params;
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ success: false, message: 'Year and month are required' });
        }

        const data = await findOverridesByVenueAndMonth(id, parseInt(year), parseInt(month));
        
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getPublicSlotOverview:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch slot overview"
        });
    }
};