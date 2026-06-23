import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use(async (config) => {
  if (keycloak.authenticated && keycloak.token) {
    await keycloak.updateToken(30).catch(() => {});
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

export default api;
