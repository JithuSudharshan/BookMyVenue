import axiosInstance from "../axiosConfig";

export const getHomeData = async () => {
  try {
    const response = await axiosInstance.get("/home");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching home data", error);
    throw error;
  }
};

export const getVenues = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/venues", { params: filters });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching venues", error);
    throw error;
  }
};
export const getVenueById = async (id) => {
  try {
    const response = await axiosInstance.get(`/venues/public/${id}`);
    return response.data.venue;
  } catch (error) {
    console.error("Error fetching venue details", error);
    throw error;
  }
};
