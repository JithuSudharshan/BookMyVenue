import { getFeaturedVenuesService, getPopularCategoriesService, getPopularVenuesService } from "../../services/user/homeService.js";

export const loadHome = async (req, res) => {
    try {
        const popularCategories = await getPopularCategoriesService();
        const featuredVenues = await getFeaturedVenuesService();
        const popularVenues = await getPopularVenuesService();

        res.status(200).json({
            success: true,
            message: "Home data fetched successfully",
            data: {
                popularCategories,
                featuredVenues,
                popularVenues
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};