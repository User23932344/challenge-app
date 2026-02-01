import { apiClient } from './client';
import type { LoginCredentials, RegisterCredentials } from '../types';

export const authAPI = {
  register: async (credentials: RegisterCredentials) => {
    const response = await apiClient.post('/auth/register', credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
};