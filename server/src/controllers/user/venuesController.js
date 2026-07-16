import { getVenuesService } from "../../services/user/venuesService.js";

export const LoadVenues = async (req, res) => {
    try {
        const venues = await getVenuesService();

        res.status(200).json({
            success: true,
            data: venues
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};