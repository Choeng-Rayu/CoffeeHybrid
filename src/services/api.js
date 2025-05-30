import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  registerTelegram: async (telegramData) => {
    const response = await api.post('/auth/register-telegram', telegramData);
    return response.data;
  }
};

// Menu API calls
export const menuAPI = {
  getMenu: async (category = null) => {
    const url = category ? `/menu/category/${category}` : '/menu';
    const response = await api.get(url);
    return response.data;
  },

  getProduct: async (productId) => {
    const response = await api.get(`/menu/product/${productId}`);
    return response.data;
  },

  initializeMenu: async () => {
    const response = await api.post('/menu/initialize');
    return response.data;
  }
};

// Orders API calls
export const ordersAPI = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrderQR: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/qr`, {
      responseType: 'blob'
    });
    return response.data;
  },

  verifyQR: async (qrToken) => {
    const response = await api.post('/orders/verify-qr', { qrToken });
    return response.data;
  },

  getUserOrders: async (userId, params = {}) => {
    const response = await api.get(`/orders/user/${userId}`, { params });
    return response.data;
  },

  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
