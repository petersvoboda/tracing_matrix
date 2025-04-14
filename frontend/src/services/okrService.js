import apiClient from '../lib/api'; // Corrected path

const BASE_URL = '/okrs';

export const getOkrs = async () => {
  try {
    const response = await apiClient.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching OKRs:', error);
    throw error;
  }
};

export const getOkrById = async (id) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching OKR ${id}:`, error);
    throw error;
  }
};

export const createOkr = async (okrData) => {
  try {
    const response = await apiClient.post(BASE_URL, okrData);
    return response.data;
  } catch (error) {
    console.error('Error creating OKR:', error);
    throw error;
  }
};

export const updateOkr = async (id, okrData) => {
  try {
    const response = await apiClient.put(`${BASE_URL}/${id}`, okrData);
    return response.data;
  } catch (error) {
    console.error(`Error updating OKR ${id}:`, error);
    throw error;
  }
};

export const deleteOkr = async (id) => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting OKR ${id}:`, error);
    throw error;
  }
};

// TODO: Add service function to fetch users for the owner dropdown
export const getUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};