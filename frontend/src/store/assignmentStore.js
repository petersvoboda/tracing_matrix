import { create } from 'zustand';
import apiClient from '../lib/api';
import useTaskStore from './taskStore'; // To potentially update task status after assignment

const useAssignmentStore = create((set, get) => ({
  selectedTaskId: null,
  suggestions: [],
  resourceLoads: {}, // Store load data keyed by resource ID
  loadingSuggestions: false,
  loadingAssignment: false,
  loadingResourceLoad: false, // Separate loading for load data
  error: null,

  setSelectedTask: (taskId) => {
    set({ selectedTaskId: taskId, suggestions: [], error: null }); // Clear old suggestions
    if (taskId) {
      get().fetchSuggestions(taskId);
      // TODO: Maybe fetch load for all relevant resources here too? Or on demand.
    }
  },

  fetchSuggestions: async (taskId) => {
    if (!taskId) return;
    set({ loadingSuggestions: true, error: null });
    try {
      const response = await apiClient.get(`/tasks/${taskId}/suggestions`);
      set({ suggestions: response.data, loadingSuggestions: false });
      // After getting suggestions, fetch load data for suggested resources
      response.data.forEach(suggestion => {
        get().fetchResourceLoad(suggestion.resource_id); // Fetch load for each suggested resource
      });
    } catch (error) {
      console.error(`Failed to fetch suggestions for task ${taskId}:`, error);
      set({ error: error.message || 'Failed to fetch suggestions', loadingSuggestions: false });
    }
  },

  fetchResourceLoad: async (resourceId, sprintId = null) => {
    // Avoid refetching if data exists and isn't stale? For now, always fetch.
    set({ loadingResourceLoad: true }); // Use a general loading flag or per-resource
     try {
       const params = sprintId ? { sprint_id: sprintId } : {};
       const response = await apiClient.get(`/resources/${resourceId}/load`, { params });
       set((state) => ({
         resourceLoads: {
           ...state.resourceLoads,
           [resourceId]: response.data, // Store load data by resource ID
         },
         loadingResourceLoad: false,
       }));
     } catch (error) {
       console.error(`Failed to fetch load for resource ${resourceId}:`, error);
       // Handle error state appropriately, maybe per-resource?
       set({ loadingResourceLoad: false }); // Ensure loading stops
     }
  },

  assignResource: async (taskId, resourceId) => {
    set({ loadingAssignment: true, error: null });
    try {
      await apiClient.post('/assignments', { task_id: taskId, resource_id: resourceId });
      set({ loadingAssignment: false });
      // Refresh task list to show assignment / updated status
      useTaskStore.getState().fetchTasks();
      // Clear suggestions for the assigned task
      if (get().selectedTaskId === taskId) {
        set({ suggestions: [] });
      }
      // TODO: Re-fetch resource load?
      get().fetchResourceLoad(resourceId);

    } catch (error) {
      console.error(`Failed to assign resource ${resourceId} to task ${taskId}:`, error);
      set({ error: error.message || 'Failed to assign resource', loadingAssignment: false });
      throw error; // Re-throw for component handling
    }
  },

  unassignResource: async (taskId, resourceId) => {
     set({ loadingAssignment: true, error: null });
     try {
       await apiClient.delete(`/assignments/${taskId}`); // API uses task ID for deletion
       set({ loadingAssignment: false });
       // Refresh task list
       useTaskStore.getState().fetchTasks();
       // Re-fetch suggestions if this was the selected task
       if (get().selectedTaskId === taskId) {
         get().fetchSuggestions(taskId);
       }
        // TODO: Re-fetch resource load?
        if (resourceId) { // Need the resourceId to update its load
             get().fetchResourceLoad(resourceId);
        }

     } catch (error) {
       console.error(`Failed to unassign task ${taskId}:`, error);
       set({ error: error.message || 'Failed to unassign resource', loadingAssignment: false });
       throw error;
     }
  },

}));

export default useAssignmentStore;