import apiClient from '../lib/api'; // Corrected path

const BASE_URL = '/risks';

export const getRisks = async (params = {}) => {
  try {
    // Pass query parameters for filtering/sorting if needed
    const response = await apiClient.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching risks:', error);
    throw error;
  }
};

export const createRisk = async (riskData) => {
  try {
    const response = await apiClient.post(BASE_URL, riskData);
    return response.data;
  } catch (error) {
    console.error('Error creating risk:', error);
    throw error;
  }
};

export const updateRisk = async (id, riskData) => {
    console.log('updateRisk called with id:', id, 'URL:', `${BASE_URL}/${id}`);
  try {
    const response = await apiClient.put(`${BASE_URL}/${id}`, riskData);
    return response.data;
  } catch (error) {
    console.error(`Error updating risk ${id}:`, error);
    throw error;
  }
};

export const deleteRisk = async (id) => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting risk ${id}:`, error);
    throw error;
  }
};

// Note: Fetching users for the owner dropdown might be handled by a separate userService
// or potentially reused from okrService if it's implemented there.