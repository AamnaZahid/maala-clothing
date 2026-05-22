import api from './api';

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post('/api/auth/login', credentials);
    return data.data;
  },
  register: async (payload) => {
    const { data } = await api.post('/api/auth/register', payload);
    return data.data;
  },
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/api/auth/logout', { refreshToken });
    }
  },
  changePassword: async (payload) => {
    const { data } = await api.post('/api/profile/change-password', payload);
    return data.data;
  },
};
