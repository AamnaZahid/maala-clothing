import axios from 'axios';
import { loginPath } from '../utils/assetUrl';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
          const payload = data.data;
          localStorage.setItem('accessToken', payload.accessToken);
          localStorage.setItem('refreshToken', payload.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = loginPath();
          }
        }
      } else if (!window.location.pathname.includes('/login')) {
        window.location.href = loginPath();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export function getApiError(error) {
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
    return 'Cannot reach the shop server. It may be sleeping or not deployed yet. Please try again in a minute or contact the shop owner.';
  }
  const data = error.response?.data;
  if (data?.errors) {
    const messages = Object.values(data.errors).filter(Boolean);
    if (messages.length) return messages.join('. ');
  }
  return data?.message || error.message || 'Something went wrong';
}
