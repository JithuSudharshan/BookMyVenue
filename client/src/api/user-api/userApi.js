import axiosInstance from "../../services/axiosInstance";

export const getHomeData = async () => {
  try {
    const response = await axiosInstance.get("/home");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching home data", error);
    throw error;
  }
};

export const getVenues = async () => {
  try {
    const response = await axiosInstance.get("/venues");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching venues", error);
    throw error;
  }
};
