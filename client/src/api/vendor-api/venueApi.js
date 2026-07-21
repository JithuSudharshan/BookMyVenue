import axiosInstance from '../axiosConfig';

export const publicVenueApi = {
  getVenueById: async (id) => {
    const response = await axiosInstance.get(`/venues/public/${id}`);
    return response.data;
  },
};
