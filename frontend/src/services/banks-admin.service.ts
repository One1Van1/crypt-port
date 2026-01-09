import { apiClient } from './api';

export interface CreateBankPayload {
  name: string;
  code?: string;
}

export const banksAdminService = {
  create: async (payload: CreateBankPayload): Promise<void> => {
    await apiClient.post('/banks', payload);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/banks/${id}`);
  },
};
