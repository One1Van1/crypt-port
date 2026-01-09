import { apiClient } from './api';

export interface DropNeoBank {
  id: number;
  provider: string;
  accountId: string;
  status: 'active' | 'frozen';
  currentBalance: number;
  alias?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  drop?: {
    id: number;
    name: string;
    status?: string;
  };
  platform?: {
    id: number;
    name: string;
    status?: string;
  };
  createdAt: string;
}

export interface CreateDropNeoBankDto {
  provider: string;
  accountId: string;
  dropId: number;
  platformId: number;
  currentBalance?: number;
  alias?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface UpdateDropNeoBankDto {
  provider?: string;
  dropId?: number;
  platformId?: number;
  accountId?: string;
  status?: 'active' | 'frozen';
  currentBalance?: number;
  alias?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
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

export interface DropNeoBankLimitsRemaining {
  id: number;
  provider: string;
  accountId: string;
  status: 'active' | 'frozen';
  alias?: string | null;
  dropId: number;
  dropName: string;
  platformId?: number | null;
  platformName?: string | null;
  dailyLimit?: number | null;
  dailyLimitRemaining?: number | null;
  monthlyLimit?: number | null;
  monthlyLimitRemaining?: number | null;
}

export interface GetNeoBankLimitsRemainingParams {
  dropId?: number;
  platformId?: number;
  provider?: string;
  status?: string;
}

export interface NeoBankWithdrawalsHistoryUser {
  id: number;
  username: string;
  email?: string | null;
}

export interface NeoBankWithdrawalsHistoryItem {
  id: number;
  amount: number;
  transactionId: number;
  createdAt: string;
  withdrawnByUser: NeoBankWithdrawalsHistoryUser;
}

export interface GetNeoBankWithdrawalsHistoryParams {
  neoBankId: number;
  limit?: number;
  offset?: number;
}

const dropNeoBanksService = {
  async getAll(params?: GetAllDropNeoBanksParams) {
    const response = await apiClient.get<{ items: DropNeoBank[] }>('/drop-neo-banks', { params });
    return response.data;
  },

  async getLimitsRemaining(params?: GetNeoBankLimitsRemainingParams) {
    const response = await apiClient.get<{ items: DropNeoBankLimitsRemaining[] }>(
      '/drop-neo-banks/limits-remaining',
      { params },
    );
    return response.data;
  },

  async getWithdrawalsHistory(params: GetNeoBankWithdrawalsHistoryParams) {
    const response = await apiClient.get<{ items: NeoBankWithdrawalsHistoryItem[]; total: number }>(
      '/drop-neo-banks/withdrawals-history',
      { params },
    );
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
