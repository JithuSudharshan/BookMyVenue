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

export const getUsers = () => request('/admin/users');

export const getVendors = () => request('/admin/vendors');

export const blockUser = (userId) =>
  request(`/admin/users/${userId}/block`, {
    method: 'PATCH',
  });

export const unblockUser = (userId) =>
  request(`/admin/users/${userId}/unblock`, {
    method: 'PATCH',
  });

export const updateVendorVerification = (vendorId, status, rejectReason) =>
  request(`/admin/vendors/${vendorId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(rejectReason && { rejectReason }) }),
  });
