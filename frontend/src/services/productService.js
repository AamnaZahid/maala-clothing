import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const { data } = await api.get('/api/products', { params });
    return data.data;
  },
  getProduct: async (id) => {
    const { data } = await api.get(`/api/products/${id}`);
    return data.data;
  },
  getFeatured: async () => {
    const { data } = await api.get('/api/products/featured');
    return data.data;
  },
  getCategories: async () => {
    const { data } = await api.get('/api/categories');
    return data.data;
  },
};
