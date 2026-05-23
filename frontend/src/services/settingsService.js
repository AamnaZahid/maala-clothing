import api from './api';

export const settingsService = {
  getPublicSettings: async () => {
    const { data } = await api.get('/api/settings/public');
    return data.data;
  },
  getPaymentAccounts: async () => {
    const { data } = await api.get('/api/payment-accounts/public');
    return data.data;
  },
};

export const adminService = {
  getDashboardStats: async () => {
    const { data } = await api.get('/api/admin/dashboard/stats');
    return data.data;
  },
  getRecentOrders: async () => {
    const { data } = await api.get('/api/admin/dashboard/recent-orders');
    return data.data;
  },
  getOrders: async (params) => {
    const { data } = await api.get('/api/admin/orders', { params });
    return data.data;
  },
  getOrder: async (id) => {
    const { data } = await api.get(`/api/admin/orders/${id}`);
    return data.data;
  },
  updateOrderStatus: async (id, status) => {
    const { data } = await api.put(`/api/admin/orders/${id}/status`, { status });
    return data.data;
  },
  updateTracking: async (id, leopardTrackingNumber) => {
    const { data } = await api.put(`/api/admin/orders/${id}/tracking`, { leopardTrackingNumber });
    return data.data;
  },
  updateNotes: async (id, adminNotes) => {
    const { data } = await api.put(`/api/admin/orders/${id}/notes`, { adminNotes });
    return data.data;
  },
  getProducts: async (page = 0, size = 20) => {
    const { data } = await api.get('/api/admin/products', { params: { page, size } });
    return data.data;
  },
  getProduct: async (id) => {
    const { data } = await api.get(`/api/admin/products/${id}`);
    return data.data;
  },
  createProduct: async (payload) => {
    const { data } = await api.post('/api/admin/products', payload);
    return data.data;
  },
  updateProduct: async (id, payload) => {
    const { data } = await api.put(`/api/admin/products/${id}`, payload);
    return data.data;
  },
  deleteProduct: async (id) => {
    await api.delete(`/api/admin/products/${id}`);
  },
  getLowStock: async () => {
    const { data } = await api.get('/api/admin/products/low-stock');
    return data.data;
  },
  createCategory: async (payload) => {
    const { data } = await api.post('/api/admin/categories', payload);
    return data.data;
  },
  updateCategory: async (id, payload) => {
    const { data } = await api.put(`/api/admin/categories/${id}`, payload);
    return data.data;
  },
  deleteCategory: async (id) => {
    await api.delete(`/api/admin/categories/${id}`);
  },
  getSettings: async () => {
    const { data } = await api.get('/api/admin/settings');
    return data.data;
  },
  updateSettings: async (payload) => {
    const { data } = await api.put('/api/admin/settings', payload);
    return data.data;
  },
  testWhatsApp: async () => {
    await api.post('/api/admin/settings/test-whatsapp');
  },
  getPaymentAccountsAdmin: async () => {
    const { data } = await api.get('/api/admin/payment-accounts');
    return data.data;
  },
  createPaymentAccount: async (payload) => {
    const { data } = await api.post('/api/admin/payment-accounts', payload);
    return data.data;
  },
  updatePaymentAccount: async (id, payload) => {
    const { data } = await api.put(`/api/admin/payment-accounts/${id}`, payload);
    return data.data;
  },
  deletePaymentAccount: async (id) => {
    await api.delete(`/api/admin/payment-accounts/${id}`);
  },
  getReport: async ({ range = 'month', year, month } = {}) => {
    const params = { range };
    if (year) params.year = year;
    if (month) params.month = month;
    const { data } = await api.get('/api/admin/reports/summary', { params });
    return data.data;
  },
  getStockPurchases: async (page = 0, size = 20) => {
    const { data } = await api.get('/api/admin/stock-purchases', { params: { page, size } });
    return data.data;
  },
  recordStockPurchase: async (payload) => {
    const { data } = await api.post('/api/admin/stock-purchases', payload);
    return data.data;
  },
  deleteStockPurchase: async (id) => {
    await api.delete(`/api/admin/stock-purchases/${id}`);
  },
};
