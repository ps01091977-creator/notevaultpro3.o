import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data, isLoading: false });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      verifyOtp: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/verify-otp', { email, otp });
          set({ user: data, isLoading: false });
          return data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'OTP verification failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      resendOtp: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/resend-otp', { email });
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to resend OTP', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      logout: () => set({ user: null, error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        user: persistedState.user,
      }),
    }
  )
);
