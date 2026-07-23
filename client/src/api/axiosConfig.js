import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Automatically send and receive HttpOnly cookies
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach admin token for admin routes
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith('/admin')) {
      const adminToken = localStorage.getItem('bookmyvenue_admin_token');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If the failing request was the refresh token route itself, reject immediately
      if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login') {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request until the token is refreshed
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        await axiosInstance.post('/auth/refresh');
        
        isRefreshing = false;
        processQueue(null);
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err);
        
        // Dispatch custom event to notify AuthContext to clear state
        window.dispatchEvent(new Event('auth-logout'));
        
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

