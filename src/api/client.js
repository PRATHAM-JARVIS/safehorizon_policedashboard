import axios from 'axios';
import { apiCache, requestDeduplicator } from '../utils/performanceOptimizations.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with optimized defaults
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
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

// Request interceptor to add auth token and handle caching
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging and performance monitoring
    config.metadata = { startTime: new Date() };
    
    // Handle GET request caching
    if (config.method === 'get' && !config.skipCache) {
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        // Return cached response
        config.adapter = () => {
          return Promise.resolve({
            data: cached,
            status: 200,
            statusText: 'OK (Cached)',
            headers: config.headers,
            config,
            request: {}
          });
        };
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors, logging, and caching
apiClient.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get' && !response.config.skipCache) {
      const cacheKey = `${response.config.url}_${JSON.stringify(response.config.params || {})}`;
      const cacheTTL = response.config.cacheTTL || 30000; // Default 30 seconds
      apiCache.set(cacheKey, response.data, cacheTTL);
    }
    
    return response;
  },
  (error) => {
    // Enhanced error logging
    const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
    const status = error.response?.status;
    
    // Only log errors that aren't expected/handled (403, 404 on analytics can be expected)
    const isExpectedError = (status === 403 || status === 404) && 
                            (error.config?.url?.includes('/analytics') || 
                             error.config?.url?.includes('/incident/reopen'));
    
    if (!isExpectedError) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, {
        status: status,
        message: error.message,
        data: error.response?.data,
        url: error.config?.url
      });
    }

    // Handle different error types
    if (status === 401) {
      tokenManager.clearToken();
      window.location.href = '/login';
    } else if (status === 404) {
      // Resource not found
    } else if (status === 500) {
      console.error('🔥 Server error:', error.response?.data);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - Backend may be down or CORS issue');
    }

    return Promise.reject(error);
  }
);

// Optimized API call wrapper with request deduplication
export const optimizedApiCall = (url, options = {}) => {
  const dedupeKey = `${options.method || 'get'}_${url}_${JSON.stringify(options.params || {})}`;
  
  return requestDeduplicator.dedupe(dedupeKey, () => {
    return apiClient(url, options);
  });
};

// Clear cache on logout or token change
export const clearApiCache = () => {
  apiCache.clear();
};

export default apiClient;