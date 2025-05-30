import axios from 'axios';
import config from '../config/config.js';

class ApiService {
  constructor() {
    this.baseURL = config.API_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  async registerUser(telegramData) {
    try {
      const response = await this.client.post('/auth/register-telegram', telegramData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        // User already exists, try to get user info
        return { user: { id: telegramData.telegramId, username: telegramData.username } };
      }
      throw error;
    }
  }

  async getMenu(category = null) {
    const url = category ? `/menu/category/${category}` : '/menu';
    const response = await this.client.get(url);
    return response.data;
  }

  async createOrder(orderData) {
    const response = await this.client.post('/orders', orderData);
    return response.data;
  }

  async getUserOrders(userId, limit = 10) {
    const response = await this.client.get(`/orders/user/${userId}`, {
      params: { limit }
    });
    return response.data;
  }

  async getOrderDetails(orderId) {
    const response = await this.client.get(`/orders/${orderId}`);
    return response.data;
  }

  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export default new ApiService();
