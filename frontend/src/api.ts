import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

api.interceptors.request.use((config) => {
  if (authToken && config.headers) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

export default api;
