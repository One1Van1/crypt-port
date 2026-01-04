import { apiClient } from './api';

export interface DropNeoBank {
  id: number;
  provider: 'ripio' | 'lemon_cash' | 'satoshi_tango' | 'yont';
  accountId: string;
  status: 'active' | 'frozen';
  currentBalance: number;
  comment?: string;
  drop: {
    id: number;
    name: string;
    status?: string;
  };
  createdAt: string;
}

export interface CreateDropNeoBankDto {
  dropId: number;
  provider: 'ripio' | 'lemon_cash' | 'satoshi_tango' | 'yont';
  accountId: string;
  currentBalance?: number;
  comment?: string;
}

export interface UpdateDropNeoBankDto {
  accountId?: string;
  status?: 'active' | 'frozen';
  currentBalance?: number;
  comment?: string;
}

export interface UpdateBalanceDto {
  balance: number;
}

export interface GetAllDropNeoBanksParams {
  dropId?: number;
  platformId?: number;
  provider?: string;
  status?: string;
}

const dropNeoBanksService = {
  async getAll(params?: GetAllDropNeoBanksParams) {
    const response = await apiClient.get<{ items: DropNeoBank[] }>('/drop-neo-banks', { params });
    return response.data;
  },

  async create(data: CreateDropNeoBankDto) {
    const response = await apiClient.post<DropNeoBank>('/drop-neo-banks', data);
    return response.data;
  },

  async update(id: number, data: UpdateDropNeoBankDto) {
    const response = await apiClient.patch<DropNeoBank>(`/drop-neo-banks/${id}`, data);
    return response.data;
  },

  async updateBalance(id: number, data: UpdateBalanceDto) {
    const response = await apiClient.patch(`/drop-neo-banks/${id}/balance`, data);
    return response.data;
  },

  async delete(id: number) {
    await apiClient.delete(`/drop-neo-banks/${id}`);
  },
};

export default dropNeoBanksService;
