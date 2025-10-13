import axios from 'axios';
import { toast } from 'react-toastify';
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL);

console.log(API_BASE_URL)

const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 55000,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

// axiosInstance.defaults.xsrfCookieName = 'XSRF-TOKEN';
// axiosInstance.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API Error:", error?.response?.status, error?.message);
    return Promise.reject(error);
  }
);




export default axiosInstance;