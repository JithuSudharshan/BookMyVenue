import axiosInstance from '../axiosConfig';

export const authApi = {
  // Check Uniqueness
  checkEmail: async (email) => {
    const response = await axiosInstance.post('/auth/check-email', { email });
    return response.data;
  },
  
  checkPhone: async (phone) => {
    const response = await axiosInstance.post('/auth/check-phone', { phone });
    return response.data;
  },

  // Registration & Login
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  registerVendor: async (vendorData) => {
    const response = await axiosInstance.post('/auth/register-vendor', vendorData);
    return response.data;
  },

  completeGoogleSignup: async (token, role) => {
    const response = await axiosInstance.post('/auth/google/complete-signup', { token, role });
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  // Email Verification
  verifyEmail: async (token) => {
    const response = await axiosInstance.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await axiosInstance.post('/auth/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // User Profile
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }
};
