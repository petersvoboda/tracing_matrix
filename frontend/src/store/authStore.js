import { create } from 'zustand';
import apiClient from '../lib/api';

// Helper function to get initial state from localStorage
const getInitialAuthState = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('authUser');
  try {
    return {
      token: token || null,
      user: user ? JSON.parse(user) : null,
      isAuthenticated: !!token, // Simple check based on token presence
    };
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    localStorage.removeItem('authToken'); // Clear potentially corrupted data
    localStorage.removeItem('authUser');
    return { token: null, user: null, isAuthenticated: false };
  }
};

const useAuthStore = create((set, get) => ({
  ...getInitialAuthState(), // Initialize state from localStorage
  loading: false, // Represents loading state for auth actions (login, fetchUser)
  error: null,

  // Login action
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/login', { email, password });
      const { user, token } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user)); // Store user info

      set({ user, token, isAuthenticated: true, loading: false });
      return user; // Return user data on successful login
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      set({ error: errorMessage, loading: false, isAuthenticated: false, token: null, user: null });
      // Clear storage on failed login attempt? Optional.
      // localStorage.removeItem('authToken');
      // localStorage.removeItem('authUser');
      throw new Error(errorMessage); // Re-throw for component handling
    }
  },

  // Logout action
  logout: async () => {
    // Don't set loading true here, as it might cause UI flashes during redirect
    // set({ loading: true, error: null });
    try {
      // Call the backend logout endpoint (requires auth token)
      // Check if token exists before trying to logout on backend
      if (get().token) {
         await apiClient.post('/logout');
      }
    } catch (error) {
      // Log error but proceed with client-side logout anyway
      console.error("Backend logout failed (token might be expired/invalid):", error);
    } finally {
      // Always clear client-side state and storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Reset state, ensure loading is false
      set({ user: null, token: null, isAuthenticated: false, loading: false, error: null });
    }
  },

  // Optional: Action to fetch user data if token exists but user data is missing
  fetchUser: async () => {
    // Only fetch if token exists and user is not already loaded
    if (!get().token || get().user) {
        return;
    }
    set({ loading: true, error: null }); // Set loading true specifically for fetchUser
     try {
        const response = await apiClient.get('/user'); // Uses token from interceptor
        const user = response.data;
        localStorage.setItem('authUser', JSON.stringify(user));
        set({ user, isAuthenticated: true, loading: false });
     } catch (error) {
        console.error("Failed to fetch user with token:", error);
        // Token might be invalid, trigger logout
        get().logout(); // Call logout action to clear state
        // Don't set error here, logout handles state reset
        // set({ error: 'Session expired or invalid. Please log in again.', loading: false });
     }
  },

  // TODO: Add register action if needed

}));

// Removed automatic fetchUser call from here

export default useAuthStore;