const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN_KEY = 'bookmyvenue_admin_token';
const ADMIN_USER_KEY = 'bookmyvenue_admin_user';

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const saveAdminSession = (admin) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, admin.token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
};

export const getSavedAdmin = () => {
  const savedAdmin = localStorage.getItem(ADMIN_USER_KEY);
  return savedAdmin ? JSON.parse(savedAdmin) : null;
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

export const request = async (path, options = {}) => {
  const token = getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong. Please try again.');
    error.data = data;
    throw error;
  }

  return data;
};



