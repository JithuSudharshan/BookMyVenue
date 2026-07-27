import { request, saveAdminSession } from '../../services/httpService.js';

export const loginAdmin = async (credentials) => {
  const admin = await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  saveAdminSession(admin);
  return admin;
};

export const getDashboardStats = (params = {}) => {
  const queryStr = new URLSearchParams(params).toString();
  return request(`/admin/dashboard${queryStr ? `?${queryStr}` : ''}`);
};

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

export const updateVenueVisibility = (venueId, venueStatus) =>
  request(`/admin/venues/${venueId}/visibility`, {
    method: 'PATCH',
    body: JSON.stringify({ venueStatus }),
  });

export const getBookings = (params = {}) => {
  const queryStr = new URLSearchParams(params).toString();
  return request(`/admin/bookings${queryStr ? `?${queryStr}` : ''}`);
};

export const getBookingById = (bookingId) => request(`/admin/bookings/${bookingId}`);

export const getBookingStats = () => request('/admin/bookings/stats');

export const cancelBooking = (bookingId, cancellationData) =>
  request(`/admin/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify(cancellationData),
  });

export const getAdminWallet = (params = {}) => {
  const queryStr = new URLSearchParams(params).toString();
  return request(`/admin/wallet${queryStr ? `?${queryStr}` : ''}`);
};

