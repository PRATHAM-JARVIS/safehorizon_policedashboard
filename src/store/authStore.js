import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/services.js';
import { tokenManager } from '../api/client.js';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Demo credentials for testing without backend
          if (email === 'demo@police.com' && password === 'demo123') {
            const mockResponse = {
              access_token: 'demo_token_' + Date.now(),
              user_id: 'demo_user',
              email: 'demo@police.com',
              role: 'authority'
            };
            
            const userData = { user_id: mockResponse.user_id, email: mockResponse.email, role: mockResponse.role };
            
            tokenManager.setToken(mockResponse.access_token);
            tokenManager.setUser(userData);
            
            set({
              user: userData,
              token: mockResponse.access_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            return mockResponse;
          }
          
          const response = await authAPI.loginAuthority(email, password);
          
          const { access_token, user_id, email: userEmail, role } = response;
          const userData = { user_id, email: userEmail, role };
          
          tokenManager.setToken(access_token);
          tokenManager.setUser(userData);
          
          set({
            user: userData,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return response;
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        tokenManager.clearToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      initialize: () => {
        const token = tokenManager.getToken();
        const user = tokenManager.getUser();
        
        if (token && user) {
          set({
            user,
            token,
            isAuthenticated: true,
          });
        }
      },

      clearError: () => set({ error: null }),

      getCurrentUser: async () => {
        try {
          const userData = await authAPI.getCurrentUser();
          set({ user: userData });
          return userData;
        } catch (error) {
          console.error('Failed to get current user:', error);
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);