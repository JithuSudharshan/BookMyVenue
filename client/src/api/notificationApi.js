import axiosInstance from './axiosConfig';

const BASE_URL = '/notifications';

const getHeaders = () => {
  // Only use the admin token if we are actively on the admin portal
  if (window.location.pathname.startsWith('/admin')) {
    const adminToken = localStorage.getItem('bookmyvenue_admin_token');
    if (adminToken) {
      return { headers: { Authorization: `Bearer ${adminToken}` } };
    }
  }
  return {};
};

export const notificationApi = {
  getNotifications: async (limit = 50, skip = 0) => {
    const response = await axiosInstance.get(`${BASE_URL}?limit=${limit}&skip=${skip}`, getHeaders());
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosInstance.patch(`${BASE_URL}/${id}/read`, {}, getHeaders());
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.patch(`${BASE_URL}/read-all`, {}, getHeaders());
    return response.data;
  }
};
