import api from './api';

export const orderService = {
  placeOrder: async (payload) => {
    const { data } = await api.post('/api/orders', payload);
    return data.data;
  },
  trackOrder: async (orderNumber, phone) => {
    const { data } = await api.get(`/api/orders/track/${orderNumber}`, { params: { phone } });
    return data.data;
  },
  getMyOrders: async (page = 0, size = 10) => {
    const { data } = await api.get('/api/orders/my', { params: { page, size } });
    return data.data;
  },
};
