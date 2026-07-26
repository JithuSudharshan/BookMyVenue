import axiosInstance from "../axiosConfig";

export const getHomeData = async () => {
  try {
    const response = await axiosInstance.get("/home");
    return response.data?.data;
  } catch (error) {

    throw error;
  }
};

export const getVenues = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/venues", { params: filters });
    return response.data?.data;
  } catch (error) {

    throw error;
  }
};
export const getVenueById = async (id) => {
  try {
    const response = await axiosInstance.get(`/venues/public/${id}`);
    return response.data?.data ?? response.data.venue;
  } catch (error) {

    throw error;
  }
};
export const getPublicAvailability = async (id, params) => {
  try {
    const response = await axiosInstance.get(`/venues/public/${id}/availability`, { params });
    return response.data?.data;
  } catch (error) {
    throw error;
  }
};

