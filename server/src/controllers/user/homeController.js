import { getHomeVenuesService } from "../../services/user/homeService.js";

export const loadHome = async (req, res) => {
    try {
        const venues = await getHomeVenuesService();

        res.status(200).json({
            success: true,
            message: "Home data fetched successfully",
            data: {
                venues
            }
        });

    } catch (error) {
        console.error("Error in loadHome controller:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};