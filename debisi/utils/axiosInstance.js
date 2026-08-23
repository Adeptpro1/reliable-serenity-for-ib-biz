import axios from "axios";

// Constants for API endpoints
export const API_ROUTES = {
  UPLOAD: '/api/upload',
  PAYMENT: {
    INITIALIZE: '/api/payment/initialize',
    VERIFY: '/api/payment/verify',
  },
  // Add other REST endpoints here
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:3002/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the same token that Apollo Client uses
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token and notify auth state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Dispatch an event that can be listened to by your auth state manager
        window.dispatchEvent(new Event('auth:logout'));
      }
      
      // Redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// Utility functions for common REST operations
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post(API_ROUTES.UPLOAD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress?.(percentCompleted);
    },
  });
};

export const initializePayment = async (paymentData) => {
  return axiosInstance.post(API_ROUTES.PAYMENT.INITIALIZE, paymentData);
};

export const verifyPayment = async (reference) => {
  return axiosInstance.get(`${API_ROUTES.PAYMENT.VERIFY}/${reference}`);
};

export default axiosInstance;
