import axios from 'axios';

// The backend routes in the app are mounted under `/api` already.
// Keep the base URL at the server root (no trailing `/api`) so frontend calls
// that include `/api/...` don't end up with `/api/api/...` which causes 404s.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 55000,
  withCredentials: true,
  // Do not set a default Content-Type here. Let the browser set it
  // automatically (especially important for FormData / file uploads).
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken'); // or 'token' if you're using user tokens
    if (token) {
      config.headers['x-admin-token'] = token;
    }
    // If we're sending a FormData instance (file upload), remove any
    // explicit Content-Type header so the browser can add the correct
    // multipart/form-data; boundary=... header. Having 'application/json'
    // prevents multer from parsing the file.
    if (config.data && typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Authentication error:', error.response?.data?.message || 'Unauthorized');
      // Optionally redirect to login or show a message
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;