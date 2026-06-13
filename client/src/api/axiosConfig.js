import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true, // Automatically send and receive HttpOnly cookies
});

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the token is invalid or expired
    if (error.response && error.response.status === 401) {
      // The context handles fetching user, so we don't necessarily redirect here 
      // unless we want to force them out on 401 globally.
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
