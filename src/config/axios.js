import axios from 'axios';
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:3000';

const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
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
		const status = error?.response?.status;
		if (status === 401) {
			try {
				window.location.href = '/admin/login';
			} catch (e) {
                console.error(e)
			}
		}
		return Promise.reject(error);
	}

);



export default axiosInstance;