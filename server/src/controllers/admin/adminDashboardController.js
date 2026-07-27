import { getDashboardStatsService } from "../../services/admin/adminDashboardService.js";

export const getDashboardStats = async (req, res) => {
  try {
    const { timeframe, startDate, endDate } = req.query;

    const stats = await getDashboardStatsService({
      timeframe,
      startDate,
      endDate,
    });

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
