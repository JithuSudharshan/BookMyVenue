import { getDashboardCounts } from "../../repositories/admin/adminDashboardRepository.js";

export const getDashboardStatsService = async () => {
  return await getDashboardCounts();
};
