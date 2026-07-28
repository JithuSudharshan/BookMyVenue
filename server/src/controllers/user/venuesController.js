import { getVenuesService } from "../../services/user/venuesService.js";
import { findOverridesByVenueAndMonth } from "../../repositories/vendor/slotOverrideRepository.js";
import { getVenueAvailabilityForDate, getVenueAvailabilityForMonth } from "../../services/user/availabilityService.js";

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

export const getPublicAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, year, month } = req.query;

        let data;
        if (date) {
            data = await getVenueAvailabilityForDate(id, date);
        } else if (year && month) {
            data = await getVenueAvailabilityForMonth(id, parseInt(year), parseInt(month));
        } else {
            return res.status(400).json({ success: false, message: 'Either date or (year and month) are required' });
        }
        
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getPublicAvailability:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch availability"
        });
    }
};