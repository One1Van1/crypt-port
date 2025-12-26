import { apiClient } from './api';

export interface BankAccount {
  id: number;
  cbu: string;
  alias: string;
  status: string;
  priority: number;
  limitAmount: number;
  withdrawnAmount: number;
  availableAmount?: number;
  bankId: number;
  bankName?: string;
  dropId: number;
  dropName?: string;
  createdAt?: string;
  updatedAt?: string;
  bank?: {
    id: number;
    name: string;
    code?: string;
  };
  drop?: {
    id: number;
    name: string;
  };
}

export interface GetBankAccountsResponse {
  items: BankAccount[];
  total: number;
}

class BankAccountsService {
  async getAll(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    status?: string;
  }): Promise<GetBankAccountsResponse> {
    const response = await apiClient.get<GetBankAccountsResponse>('/bank-accounts', { params });
    return response.data;
  }

  async getById(id: string): Promise<BankAccount> {
    const response = await apiClient.get<BankAccount>(`/bank-accounts/${id}`);
    return response.data;
  }

  async create(data: {
    userId: string;
    bankId: string;
    cbu: string;
    alias: string;
    accountType: string;
    limitAmount?: number;
    priority?: number;
  }): Promise<BankAccount> {
    const response = await apiClient.post<BankAccount>('/bank-accounts', data);
    return response.data;
  }

  async update(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
    const response = await apiClient.patch<BankAccount>(`/bank-accounts/${id}`, data);
    return response.data;
  }

  async updateStatus(id: string, status: string): Promise<BankAccount> {
    const response = await apiClient.patch<BankAccount>(`/bank-accounts/${id}/status`, { status });
    return response.data;
  }

  async updatePriority(id: string, priority: number): Promise<BankAccount> {
    const response = await apiClient.patch<BankAccount>(`/bank-accounts/${id}/priority`, { priority });
    return response.data;
  }

  async getAvailable(params?: { amount?: number; bankId?: number }): Promise<BankAccount> {
    const response = await apiClient.get<BankAccount>('/bank-accounts/available', { params });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/bank-accounts/${id}`);
  }
}

export const bankAccountsService = new BankAccountsService();
