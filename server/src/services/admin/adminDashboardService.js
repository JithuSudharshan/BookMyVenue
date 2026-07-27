import { getDashboardFullData } from "../../repositories/admin/adminDashboardRepository.js";

export const getDashboardStatsService = async (queryOptions = {}) => {
  return await getDashboardFullData(queryOptions);
};
