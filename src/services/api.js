import axios from 'axios';

const productionApiUrl = 'https://smart-hospital-backend-1jk2.onrender.com/api';
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

// Vite injects VITE_* variables at build time. Keep a production fallback so
// the deployed app never silently tries to call localhost if Render is missing
// the environment variable. Local development still defaults to port 8080.
const apiBaseUrl = (configuredApiUrl || (import.meta.env.PROD ? productionApiUrl : 'http://localhost:8080/api'))
  .replace(/\/+$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach the JWT bearer token to every authenticated request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired/invalid sessions consistently. Do not redirect for login/register
// failures because those pages need to display the API error to the user.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      const isPublicAuthPage = path === '/login' || path === '/register';
      const isAuthMeRequest = error.config?.url?.includes('/auth/me');

      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');

      if (!isPublicAuthPage && !isAuthMeRequest) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
