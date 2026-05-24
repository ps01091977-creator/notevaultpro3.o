import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  baseURL = import.meta.env.DEV 
    ? 'http://localhost:5000/api' 
    : 'https://notevaultpro3-o-backend.onrender.com/api';
} else {
  // Ensure that /api is appended if the user provided VITE_API_URL without it
  if (!baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
    baseURL = baseURL.endsWith('/') ? `${baseURL}api` : `${baseURL}/api`;
  }
}

const api = axios.create({
  baseURL,
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