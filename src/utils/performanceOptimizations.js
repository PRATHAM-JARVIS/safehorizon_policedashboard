/**
 * Performance Optimization Utilities for SafeHorizon Police Dashboard
 * 
 * This module provides utility functions for:
 * - Debouncing and throttling
 * - Memoization
 * - Request caching
 * - Performance monitoring
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * Debounce function - delays execution until after wait time has elapsed
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function - ensures function is called at most once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Custom hook for debounced values
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for throttled callback
 * @param {Function} callback - Callback function
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled callback
 */
export const useThrottle = (callback, delay = 300) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    const timeElapsed = Date.now() - lastRun.current;

    if (timeElapsed >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

/**
 * Simple in-memory cache with TTL (Time To Live)
 */
export class CacheManager {
  constructor(defaultTTL = 60000) { // 1 minute default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    // Clean expired entries first
    for (const [key, item] of this.cache.entries()) {
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

// Global cache instance
export const apiCache = new CacheManager(30000); // 30 seconds default TTL

/**
 * Cached API call wrapper
 * @param {string} cacheKey - Unique cache key
 * @param {Function} apiCall - API call function
 * @param {number} ttl - Cache TTL in milliseconds
 * @returns {Promise} API response
 */
export const cachedApiCall = async (cacheKey, apiCall, ttl = 30000) => {
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Make API call
  const result = await apiCall();
  
  // Cache result
  apiCache.set(cacheKey, result, ttl);
  
  return result;
};

/**
 * Custom hook for cached API calls
 * @param {string} cacheKey - Cache key
 * @param {Function} apiCall - API call function
 * @param {Array} dependencies - Dependencies array
 * @param {number} ttl - Cache TTL
 * @returns {Object} { data, loading, error, refetch }
 */
export const useCachedApi = (cacheKey, apiCall, dependencies = [], ttl = 30000) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchData = useCallback(async (skipCache = false) => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (skipCache) {
        apiCache.delete(cacheKey);
        result = await apiCall();
        apiCache.set(cacheKey, result, ttl);
      } else {
        result = await cachedApiCall(cacheKey, apiCall, ttl);
      }

      setData(result);
    } catch (err) {
      setError(err);
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, apiCall, ttl]);

  useEffect(() => {
    fetchData();
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = [];
  }

  start(label) {
    this.marks.set(label, performance.now());
  }

  end(label) {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark found for: ${label}`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.measures.push({ label, duration, timestamp: Date.now() });
    this.marks.delete(label);

    return duration;
  }

  log(label) {
    const duration = this.end(label);
    if (duration !== null) {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
  }

  getReport() {
    return this.measures;
  }

  clear() {
    this.marks.clear();
    this.measures = [];
  }
}

// Global performance monitor
export const perfMonitor = new PerformanceMonitor();

/**
 * Custom hook for measuring component render performance
 * @param {string} componentName - Component name
 */
export const useRenderPerformance = (componentName) => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
  });
};

/**
 * Batch updates to reduce re-renders
 * @param {Function} callback - Callback with batched updates
 */
export const batchUpdate = (callback) => {
  // In React 18+, updates are automatically batched
  // This is a placeholder for explicit batching if needed
  callback();
};

/**
 * Deep equality check for objects
 * @param {any} a - First value
 * @param {any} b - Second value
 * @returns {boolean} True if equal
 */
export const deepEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
};

/**
 * Custom hook for deep comparison of objects
 * @param {any} value - Value to compare
 * @returns {any} Memoized value
 */
export const useDeepMemo = (value) => {
  const ref = useRef(value);

  if (!deepEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
};

/**
 * Optimize array operations with memoization
 * @param {Array} array - Input array
 * @param {Function} operation - Operation function
 * @returns {Array} Result array
 */
export const memoizedArrayOperation = (() => {
  const cache = new Map();

  return (array, operation, key) => {
    const cacheKey = `${key}_${JSON.stringify(array)}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const result = operation(array);
    cache.set(cacheKey, result);

    // Limit cache size
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  };
})();

/**
 * Request deduplication - prevents duplicate simultaneous requests
 */
export class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  async dedupe(key, requestFn) {
    // If request is already in progress, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request promise
    const promise = requestFn()
      .finally(() => {
        // Clean up after request completes
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear() {
    this.pendingRequests.clear();
  }
}

// Global request deduplicator
export const requestDeduplicator = new RequestDeduplicator();

/**
 * Lazy load images with intersection observer
 * @param {HTMLImageElement} img - Image element
 */
export const lazyLoadImage = (img) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.classList.add('loaded');
          observer.unobserve(image);
        }
      });
    });

    observer.observe(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    img.src = img.dataset.src;
  }
};

export default {
  debounce,
  throttle,
  useDebounce,
  useThrottle,
  CacheManager,
  apiCache,
  cachedApiCall,
  useCachedApi,
  PerformanceMonitor,
  perfMonitor,
  useRenderPerformance,
  batchUpdate,
  deepEqual,
  useDeepMemo,
  memoizedArrayOperation,
  RequestDeduplicator,
  requestDeduplicator,
  lazyLoadImage,
};
