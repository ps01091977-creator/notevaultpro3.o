import axios from 'axios';

const isProduction = import.meta.env.MODE === 'production';

const api = axios.create({
  baseURL: isProduction 
    ? 'https://notevaultpro3-o-backend.onrender.com/api'
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'),
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