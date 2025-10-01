import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    initialize,
    clearError,
    getCurrentUser,
  } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    try {
      initialize();
    } catch (err) {
      console.error('Failed to initialize auth:', err);
    }
  }, [initialize]);

  const isAdmin = user?.role === 'admin';
  const isAuthority = user?.role === 'authority' || isAdmin;

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isAuthority,
    login,
    logout,
    clearError,
    getCurrentUser,
  };
};