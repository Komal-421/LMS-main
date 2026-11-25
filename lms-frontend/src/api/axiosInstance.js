import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'token';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject({
        status: 0,
        message: 'Request canceled',
        isCanceled: true,
        isNetworkError: false,
        raw: error,
      });
    }

    const status = error.response?.status ?? 0;
    const responseData = error.response?.data;

    let message = 'An unexpected error occurred. Please try again.';
    if (!error.response) {
      message =
        'Unable to reach the LMS backend server. Ensure the backend is running on port 3000.';
    } else if (typeof responseData === 'string' && responseData.trim()) {
      message = responseData;
    } else if (responseData?.message) {
      message = responseData.message;
    } else if (responseData && typeof responseData === 'object') {
      // Some backend catch blocks use non-standard keys like 'message from login'
      const msgKey = Object.keys(responseData).find((k) =>
        k.toLowerCase().includes('message')
      );
      if (msgKey && typeof responseData[msgKey] === 'string') {
        message = responseData[msgKey];
      }
    }

    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    if (status === 403 && !responseData?.message) {
      message = 'You do not have permission to perform this action.';
    } else if (status === 404 && !responseData?.message) {
      message = 'Requested resource was not found.';
    } else if (status >= 500 && !responseData?.message) {
      message = 'Server error occurred while processing your request.';
    }

    return Promise.reject({
      status,
      message,
      isNetworkError: !error.response,
      isCanceled: false,
      raw: error,
    });
  }
);

export default axiosInstance;
