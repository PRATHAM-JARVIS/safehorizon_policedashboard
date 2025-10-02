import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'safehorizon_auth_token';
const USER_KEY = 'safehorizon_user_data';

export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
      status: response.status,
      dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
      dataSize: JSON.stringify(response.data).length
    });
    return response;
  },
  (error) => {
    // Enhanced error logging
    const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
    
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      url: error.config?.url
    });

    // Handle different error types
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - Redirecting to login');
      tokenManager.clearToken();
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      console.warn('🔍 Resource not found:', error.config?.url);
    } else if (error.response?.status === 500) {
      console.error('🔥 Server error:', error.response?.data);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - Backend may be down or CORS issue');
    }

    return Promise.reject(error);
  }
);

export default apiClient;