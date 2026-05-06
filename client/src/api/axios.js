import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://notevaultpro3-o-backend.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const state = JSON.parse(localStorage.getItem('auth-storage'));
  const token = state?.state?.user?.token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;