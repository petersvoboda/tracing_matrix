import { create } from 'zustand';
import apiClient from '../lib/api';

const useTaskStore = create((set) => ({
  tasks: [],
  loading: false,
  error: null,

  // Action to fetch tasks from the API
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/tasks');
      // Map response to include 'key' based on 'id' for Ant Design components
      const tasksWithKeys = response.data.map(task => ({ ...task, key: task.id.toString() }));
      set({ tasks: tasksWithKeys, loading: false });
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      set({ error: error.message || 'Failed to fetch tasks', loading: false });
    }
  },

  // Action to add a task
  addTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/tasks', taskData);
      const newTaskWithKey = { ...response.data, key: response.data.id.toString() };
      set((state) => ({
        tasks: [...state.tasks, newTaskWithKey],
        loading: false
      }));
      return newTaskWithKey;
    } catch (error) {
      console.error("Failed to add task:", error);
      set({ error: error.message || 'Failed to add task', loading: false });
      throw error;
    }
  },

  // Action to update a task
  updateTask: async (taskId, taskData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, taskData);
      const updatedTaskWithKey = { ...response.data, key: response.data.id.toString() };
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? updatedTaskWithKey : task
        ),
        loading: false,
      }));
      return updatedTaskWithKey;
    } catch (error) {
      console.error("Failed to update task:", error);
      set({ error: error.message || 'Failed to update task', loading: false });
      throw error;
    }
  },

  // Action to delete a task
  deleteTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to delete task:", error);
      set({ error: error.message || 'Failed to delete task', loading: false });
      throw error;
    }
  },

}));

export default useTaskStore;