import axiosInstance from '../axiosConfig';

/**
 * Create a new venue (submitted for approval).
 * @param {FormData} formData — multipart/form-data with venue fields + images
 */
export const createVenue = async (payload) => {
  try {
    const response = await axiosInstance.post('/vendor/venues', payload)
    return response.data.data
  } catch (error) {
    console.error('Error creating venue:', error)
    throw error
  }
}

/**
 * Save venue as draft.
 * @param {FormData|Object} data — multipart/form-data with venue fields + images
 */
export const saveDraft = async (data) => {
  try {
    const response = await axiosInstance.post('/vendor/venues/draft', data)
    return response.data.data
  } catch (error) {
    console.error('Error saving draft:', error)
    throw error
  }
}

/**
 * Get all venues for the current vendor.
 */
export const getVendorVenues = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/vendor/venues', { params })
    return response.data.data
  } catch (error) {
    console.error('Error fetching vendor venues:', error)
    throw error
  }
}

/**
 * Get a single vendor venue by ID.
 * @param {string} id
 */
export const getVendorVenueById = async (id, action = null) => {
  try {
    const params = action ? { action } : {}
    const response = await axiosInstance.get(`/vendor/venues/${id}`, { params })
    return response.data.data
  } catch (error) {
    console.error('Error fetching vendor venue:', error)
    throw error
  }
}

export const updateVenue = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`/vendor/venues/${id}`, data)
    return response.data.data
  } catch (error) {
    console.error('Error updating venue:', error)
    throw error
  }
}

export const submitVenue = async (id) => {
  try {
    const response = await axiosInstance.patch(`/vendor/venues/${id}/submit`)
    return response.data.data
  } catch (error) {
    console.error('Error submitting venue:', error)
    throw error
  }
}

export const blockVenue = async (id) => {
  try {
    const response = await axiosInstance.patch(`/vendor/venues/${id}/block`)
    return response.data.data
  } catch (error) {
    console.error('Error blocking venue:', error)
    throw error
  }
}

export const unblockVenue = async (id) => {
  try {
    const response = await axiosInstance.patch(`/vendor/venues/${id}/unblock`)
    return response.data.data
  } catch (error) {
    console.error('Error unblocking venue:', error)
    throw error
  }
}

export const updateDraft = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`/vendor/venues/${id}/draft`, data)
    return response.data.data
  } catch (error) {
    console.error('Error updating draft:', error)
    throw error
  }
}

export const getCategories = async () => {
  try {
    const response = await axiosInstance.get('/vendor/venues/categories')
    return response.data.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}



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

  updateProfile: async (data) => {
    const response = await axiosInstance.put('/vendor/profile', data);
    return response.data;
  },

  updateIdentity: async (formData) => {
    const response = await axiosInstance.put('/vendor/profile/identity', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
