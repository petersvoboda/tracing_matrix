import { create } from 'zustand';
import apiClient from '../lib/api';

const useCommonDataStore = create((set, get) => ({
  skills: [],
  domains: [],
  loadingSkills: false,
  loadingDomains: false,
  error: null, // Shared error state for simplicity, or could be separate

  fetchSkills: async () => {
    if (get().skills.length > 0) return; // Don't refetch if already loaded
    set({ loadingSkills: true, error: null });
    try {
      const response = await apiClient.get('/skills');
      set({ skills: response.data, loadingSkills: false });
    } catch (error) {
      console.error("Failed to fetch skills:", error);
      set({ error: error.message || 'Failed to fetch skills', loadingSkills: false });
    }
  },

  fetchDomains: async () => {
    if (get().domains.length > 0) return; // Don't refetch if already loaded
    set({ loadingDomains: true, error: null });
    try {
      const response = await apiClient.get('/domains');
      set({ domains: response.data, loadingDomains: false });
    } catch (error) {
      console.error("Failed to fetch domains:", error);
      set({ error: error.message || 'Failed to fetch domains', loadingDomains: false });
    }
  },

  // Optional: Combined fetch action
  fetchAllCommonData: async () => {
    // Call individual fetch actions
    await get().fetchSkills();
    await get().fetchDomains();
  },

}));

// Optional: Immediately fetch data when the store is initialized
// useCommonDataStore.getState().fetchAllCommonData();
// Or fetch within a component's useEffect hook

export default useCommonDataStore;