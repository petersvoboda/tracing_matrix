import apiClient from '../lib/api';

const BASE_URL = '/sprints';

export const getSprintById = async (id) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Sprint ${id}:`, error);
    throw error;
  }
};

export const getSprints = async () => {
  try {
    const response = await apiClient.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching sprints:', error);
    throw error;
  }
};

// Add other sprint-related service functions as needed