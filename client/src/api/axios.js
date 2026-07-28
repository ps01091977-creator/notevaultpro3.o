import axios from 'axios';

let baseURL;

if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  baseURL = 'http://localhost:5000/api';
} else {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    baseURL = envUrl;
  } else {
    baseURL = 'https://notevaultpro3-o-backend.onrender.com/api';
  }
}

if (baseURL && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
  baseURL = baseURL.endsWith('/') ? `${baseURL}api` : `${baseURL}/api`;
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