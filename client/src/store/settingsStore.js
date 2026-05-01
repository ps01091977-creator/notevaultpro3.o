import { create } from 'zustand';
import api from '../api/axios';

export const useSettingsStore = create((set, get) => ({
  settings: null,
  loading: false,
  error: null,
  fetchSettings: async () => {
    // Only fetch if not already loaded to avoid redundant calls
    if (get().settings) return;
    
    set({ loading: true, error: null });
    try {
      const response = await api.get('/settings');
      set({ settings: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ error: 'Failed to fetch settings', loading: false });
    }
  },
  updateSettings: async (newSettings) => {
    try {
      const response = await api.put('/settings', newSettings);
      set({ settings: response.data });
      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
  }
}));
