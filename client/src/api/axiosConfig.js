import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:9000/api',
});

// Request Interceptor: Attach token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the token is invalid or expired, we could trigger a logout here
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Optional: force redirect on 401
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
