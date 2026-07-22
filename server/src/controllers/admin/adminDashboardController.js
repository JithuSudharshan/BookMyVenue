import { getDashboardStatsService } from "../../services/admin/adminDashboardService.js";

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStatsService();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
