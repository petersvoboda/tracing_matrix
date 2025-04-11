import { create } from 'zustand';
import apiClient from '../lib/api'; // Import the configured Axios instance

const useResourceStore = create((set) => ({
  resources: [],
  loading: false,
  error: null,

  // Action to fetch resources from the API
  fetchResources: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/resources');
      // Assuming the API returns an array of resources, each with an 'id'
      // Map the response to include a 'key' for the Ant Design table if needed, using the 'id'
      const resourcesWithKeys = response.data.map(res => ({ ...res, key: res.id.toString() }));
      set({ resources: resourcesWithKeys, loading: false });
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      set({ error: error.message || 'Failed to fetch resources', loading: false });
    }
  },

  // Action to add a resource
  addResource: async (resourceData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/resources', resourceData);
      // Add the new resource (with its API-assigned ID) to the state
      const newResourceWithKey = { ...response.data, key: response.data.id.toString() };
      set((state) => ({
        resources: [...state.resources, newResourceWithKey],
        loading: false
      }));
      return newResourceWithKey; // Return the newly created resource

    } catch (error) {
      console.error("Failed to add resource:", error);
      set({ error: error.message || 'Failed to add resource', loading: false });
      throw error; // Re-throw error for form handling
    }
  },

  // Action to update a resource
  updateResource: async (resourceId, resourceData) => {
    set({ loading: true, error: null });
    try {
      // Note: resourceId here should be the actual resource ID, not the temporary key
      const response = await apiClient.put(`/resources/${resourceId}`, resourceData);
      const updatedResourceWithKey = { ...response.data, key: response.data.id.toString() };
      set((state) => ({
        resources: state.resources.map((res) =>
          res.id === resourceId ? updatedResourceWithKey : res // Match by actual ID
        ),
        loading: false,
      }));
      return updatedResourceWithKey; // Return the updated resource

    } catch (error) {
      console.error("Failed to update resource:", error);
      set({ error: error.message || 'Failed to update resource', loading: false });
      throw error; // Re-throw error for form handling
    }
  },

  // Action to delete a resource
  deleteResource: async (resourceId) => {
    set({ loading: true, error: null });
    try {
      // Note: resourceId here should be the actual resource ID
      await apiClient.delete(`/resources/${resourceId}`);
      set((state) => ({
        resources: state.resources.filter((res) => res.id !== resourceId), // Filter by actual ID
        loading: false,
      }));

    } catch (error) {
      console.error("Failed to delete resource:", error);
      set({ error: error.message || 'Failed to delete resource', loading: false });
      throw error; // Re-throw error if needed
    }
  },

}));

export default useResourceStore;