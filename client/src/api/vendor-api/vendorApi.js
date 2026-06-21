import axiosInstance from '../axiosConfig';

export const vendorApi = {
  getOnboardingStatus: async () => {
    const response = await axiosInstance.get('/vendor/onboarding/status');
    return response.data;
  },

  saveStep1: async (formData) => {
    const response = await axiosInstance.put('/vendor/onboarding/step/1', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  saveStep2: async (data) => {
    const response = await axiosInstance.put('/vendor/onboarding/step/2', data);
    return response.data;
  },

  saveStep3: async (formData) => {
    const response = await axiosInstance.put('/vendor/onboarding/step/3', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  submitForReview: async () => {
    const response = await axiosInstance.post('/vendor/onboarding/submit');
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/vendor/profile');
    return response.data;
  },
};
