import axiosInstance from '../axiosConfig';

/**
 * Create a new venue (submitted for approval).
 * @param {FormData} formData — multipart/form-data with venue fields + images
 */
export const createVenue = async (payload) => {
  try {
    const response = await axiosInstance.post('/vendor/venues', payload)
    return response.data?.data;
  } catch (error) {

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
    return response.data?.data;
  } catch (error) {

    throw error
  }
}

/**
 * Get all venues for the current vendor.
 */
export const getVendorVenues = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/vendor/venues', { params })
    return response.data?.data;
  } catch (error) {

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
    return response.data?.data;
  } catch (error) {

    throw error
  }
}

export const updateVenue = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`/vendor/venues/${id}`, data)
    return response.data?.data;
  } catch (error) {

    throw error
  }
}

export const submitVenue = async (id) => {
  try {
    const response = await axiosInstance.patch(`/vendor/venues/${id}/submit`)
    return response.data?.data;
  } catch (error) {

    throw error
  }
}

export const blockVenue = async (id) => {
  try {
    const response = await axiosInstance.patch(`/vendor/venues/${id}/block`)
    return response.data?.data;
  } catch (error) {

    throw error
  }
}

export const unblockVenue = async (id) => {
  try {
    const response = await axiosInstance.patch(`/vendor/venues/${id}/unblock`)
    return response.data?.data;
  } catch (error) {

    throw error
  }
}

export const updateDraft = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`/vendor/venues/${id}/draft`, data)
    return response.data?.data;
  } catch (error) {

    throw error
  }
}

export const getCategories = async () => {
  try {
    const response = await axiosInstance.get('/vendor/venues/categories')
    return response.data?.data;
  } catch (error) {

    throw error
  }
}



export const vendorApi = {
  getOnboardingStatus: async () => {
    const response = await axiosInstance.get('/vendor/onboarding/status');
    return response.data?.data ?? response.data;
  },

  saveStep1: async (formData) => {
    const response = await axiosInstance.put('/vendor/onboarding/step/1', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
  },

  saveStep2: async (data) => {
    const response = await axiosInstance.put('/vendor/onboarding/step/2', data);
    return response.data?.data ?? response.data;
  },

  saveStep3: async (formData) => {
    const response = await axiosInstance.put('/vendor/onboarding/step/3', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
  },

  submitForReview: async () => {
    const response = await axiosInstance.post('/vendor/onboarding/submit');
    return response.data?.data ?? response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/vendor/profile');
    return response.data?.data ?? response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosInstance.put('/vendor/profile', data);
    return response.data?.data ?? response.data;
  },

  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await axiosInstance.patch('/vendor/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
  },

  deleteAvatar: async () => {
    const response = await axiosInstance.delete('/vendor/profile/avatar');
    return response.data?.data ?? response.data;
  },

  updateIdentity: async (formData) => {
    const response = await axiosInstance.put('/vendor/profile/identity', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data ?? response.data;
  },
};
// ─── Slot Management API ─────────────────────────────────────────────────────
export const getSlotMonthOverview = async (venueId, year, month) => {
  const response = await axiosInstance.get(`/vendor/venues/${venueId}/availability`, { params: { year, month } });
  return response.data?.data;
};

export const getVendorDateAvailability = async (venueId, date) => {
  const response = await axiosInstance.get(`/vendor/venues/${venueId}/availability/date`, { params: { date } });
  return response.data?.data;
};

export const blockDailySlots = async (venueId, payload) => {
  const response = await axiosInstance.post(`/vendor/venues/${venueId}/availability/block/daily`, payload);
  return response.data?.data;
};

export const blockHourlySlot = async (venueId, payload) => {
  const response = await axiosInstance.post(`/vendor/venues/${venueId}/availability/block/hourly`, payload);
  return response.data?.data;
};

export const removeSlotOverride = async (venueId, payload) => {
  const response = await axiosInstance.delete(`/vendor/venues/${venueId}/availability/override`, { data: payload });
  return response.data?.data;
};

export const acknowledgeSlots = async (venueId) => {
  const response = await axiosInstance.patch(`/vendor/venues/${venueId}/availability/acknowledge`);
  return response.data?.data;
};

// ─── Vendor Bookings API ──────────────────────────────────────────────────────

/**
 * Fetch paginated bookings for the authenticated vendor.
 * @param {Object} params - { page, limit, status, venueId, bookingMode, search }
 */
export const getVendorBookings = async (params = {}) => {
  const response = await axiosInstance.get('/vendor/bookings', { params });
  return response.data;
};

/**
 * Fetch KPI stats for the vendor booking dashboard.
 */
export const getVendorBookingStats = async () => {
  const response = await axiosInstance.get('/vendor/bookings/stats');
  return response.data?.data;
};

/**
 * Fetch slim venue list for the booking filter dropdown.
 */
export const getVendorVenueList = async () => {
  const response = await axiosInstance.get('/vendor/bookings/venues');
  return response.data?.data;
};

