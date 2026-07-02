import axiosInstance from '../../services/axiosInstance'

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
 * @param {Object} data — plain JSON venue draft data
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
    // Assuming a global or vendor categories endpoint
    const response = await axiosInstance.get('/categories')
    return response.data.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

