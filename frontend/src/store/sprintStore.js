import { create } from 'zustand';
import apiClient from '../lib/api';

const useSprintStore = create((set, get) => ({
  sprints: [],
  loading: false,
  error: null,

  fetchSprints: async () => {
    // Use correct && operator
    if (get().sprints.length > 0 && !get().error) return; // Don't refetch if already loaded successfully
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/sprints');
      set({ sprints: response.data, loading: false });
    } catch (error) {
      console.error("Failed to fetch sprints:", error);
      set({ error: error.message || 'Failed to fetch sprints', loading: false });
    }
  },

  // TODO: Add actions for CRUD operations on sprints if needed later

}));

export default useSprintStore;