import axiosInstance from '../axiosConfig';

export const vendorVenueApi = {
  getMyVenues: async () => {
    const response = await axiosInstance.get('/venues/my-venues');
    return response.data;
  },
};

export const publicVenueApi = {
  getVenueById: async (id) => {
    const response = await axiosInstance.get(`/venues/public/${id}`);
    return response.data;
  },
};
