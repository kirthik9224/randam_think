import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
