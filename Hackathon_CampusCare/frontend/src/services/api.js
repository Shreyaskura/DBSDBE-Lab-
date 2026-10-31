import axios from 'axios';

/**
 * Enterprise Axios client configured for CampusCare Spring Boot REST backend integration.
 * Supports both Authorization Bearer tokens and secure HttpOnly cookies (withCredentials: true).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Inject Bearer token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campuscare_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear expired session if 401
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('campuscare_auth_token');
        localStorage.removeItem('campuscare_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
