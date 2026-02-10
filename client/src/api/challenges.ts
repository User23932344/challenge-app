import { apiClient } from './client';

export const challengesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/challenges');
    return response.data;
  },
};