import { request, saveAdminSession } from './httpService';

export const loginAdmin = async (credentials) => {
  const admin = await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  saveAdminSession(admin);
  return admin;
};

export const getDashboardStats = () => request('/admin/dashboard');

export const getUsers = (params = {}) => {
  const queryStr = new URLSearchParams(params).toString();
  return request(`/admin/users${queryStr ? `?${queryStr}` : ''}`);
};

export const getUserById = (userId) => request(`/admin/users/${userId}`);

export const getVendors = (params = {}) => {
  const queryStr = new URLSearchParams(params).toString();
  return request(`/admin/vendors${queryStr ? `?${queryStr}` : ''}`);
};

export const getVendorById = (vendorId) => request(`/admin/vendors/${vendorId}`);

export const updateUserBlockStatus = (userId, isBlocked) =>
  request(`/admin/users/${userId}/block-status`, {
    method: 'PATCH',
    body: JSON.stringify({ isBlocked }),
  });

export const updateVendorVerification = (vendorId, status, adminRemarks) =>
  request(`/admin/vendors/${vendorId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(adminRemarks && { adminRemarks }) }),
  });

export const getAdminVenues = (params = {}) => {
  const queryStr = new URLSearchParams(params).toString();
  return request(`/admin/venues${queryStr ? `?${queryStr}` : ''}`);
};

export const getAdminVenueById = (venueId) => request(`/admin/venues/${venueId}`);

export const updateVenueStatus = (venueId, status, rejectionReason) =>
  request(`/admin/venues/${venueId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(rejectionReason && { rejectionReason }) }),
  });
