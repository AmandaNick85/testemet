import axios from 'axios';

export const AUTH_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001/api';
export const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:3002/api';

const authHttpClient = axios.create({ baseURL: AUTH_URL });
const analyticsHttpClient = axios.create({ baseURL: ANALYTICS_URL });

const injectToken = (config) => {
  const token = localStorage.getItem('medmetrics_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authHttpClient.interceptors.request.use(injectToken);
analyticsHttpClient.interceptors.request.use(injectToken);

export const AuthService = {
  async login(id_institucional, password) {
    const response = await authHttpClient.post('/auth/login', { id_institucional, password });
    return response.data;
  },

  async listUsers() {
    const response = await authHttpClient.get('/auth/users');
    return response.data;
  },

  async registerUser(userData) {
    const response = await authHttpClient.post('/auth/register', userData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await authHttpClient.delete(`/auth/users/${id}`);
    return response.data;
  }
};

export const AnalyticsService = {
  async recordAtendimento(atendimentoData) {
    const response = await analyticsHttpClient.post('/analytics/atendimentos', atendimentoData);
    return response.data;
  },

  async fetchMetrics() {
    const response = await analyticsHttpClient.get('/metrics');
    return response.data;
  },

  async saveMetric(metricData) {
    const response = await analyticsHttpClient.post('/metrics', metricData);
    return response.data;
  }
};
