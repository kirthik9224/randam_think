import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach authentication & role headers
api.interceptors.request.use((config) => {
  try {
    const rawUser = localStorage.getItem('rtg_user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user.id) {
        config.headers['X-Player-Id'] = user.id;
      }
      if (user.role) {
        config.headers['X-Player-Role'] = user.role;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return config;
});

// Response interceptor to format errors nicely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please check your network or server.';
    if (error.response) {
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
    } else if (error.request) {
      message = 'Could not reach backend server at http://localhost:8080. Ensure Spring Boot is running.';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
