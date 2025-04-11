import axios from 'axios';

// Determine the base URL for the API
// Use environment variables in a real application
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'; // Default for local Laravel dev

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization token if available (e.g., from localStorage or state)
apiClient.interceptors.request.use(
  (config) => {
    // Attempt to get token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for handling common errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      console.error("Unauthorized access - Redirecting to login might be needed.");
      // window.location.href = '/login'; // Example redirect
    }
    return Promise.reject(error);
  }
);


export default apiClient;