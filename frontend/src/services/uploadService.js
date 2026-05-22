import api from './api';

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/api/upload/image', formData);
    return data.data.url;
  },
  uploadPaymentProof: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/api/upload/payment-proof', formData);
    return data.data.url;
  },
};
