import { apiClient } from './api';

export enum BankStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface Bank {
  id: string;
  name: string;
  code?: string;
  status: BankStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GetBanksResponse {
  items: Bank[];
  total: number;
}

class BanksService {
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<GetBanksResponse> {
    const response = await apiClient.get<GetBanksResponse>('/banks', { params });
    return response.data;
  }

  async getById(id: string): Promise<Bank> {
    const response = await apiClient.get<Bank>(`/banks/${id}`);
    return response.data;
  }
}

export const banksService = new BanksService();
