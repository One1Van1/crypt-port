import { apiClient } from './api';

export interface BankAccount {
  id: number;
  cbu: string;
  alias: string;
  status: string;
  priority: number;
  initialLimitAmount: number;
  currentLimitAmount: number;
  withdrawnAmount: number;
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

export interface GetRequisiteV2Platform {
  id: number;
  name: string;
  exchangeRate: number;
}

export interface GetRequisiteV2Shift {
  id: number;
  platform: GetRequisiteV2Platform;
}

export interface GetRequisiteV2NeoBank {
  id: number;
  provider: string;
  accountId: string;
  alias?: string | null;
  dailyLimit?: number | null;
  monthlyLimit?: number | null;
  dropId: number;
}

export interface SearchNeoBanksV3Item {
  id: number;
  provider: string;
  accountId: string;
  alias?: string | null;
  dailyLimit?: number | null;
  monthlyLimit?: number | null;
  dropId: number;
  dropName: string;
}

export interface SearchNeoBanksV3Response {
  items: SearchNeoBanksV3Item[];
  total: number;
}

export interface GetRequisiteV2Response {
  shift: GetRequisiteV2Shift;
  bankAccount: BankAccount;
  neoBanks: GetRequisiteV2NeoBank[];
}

export interface ReserveRequisiteV3Response {
  bankAccountId: number;
  reservationToken: string;
  expiresAt: string;
}

export interface ReleaseRequisiteV3Response {
  released: boolean;
}

export interface GetReservationStatusV3Response {
  bankAccountId: number;
  reserved: boolean;
  reservedByUserId?: number | null;
  reservedByUsername?: string | null;
  reservedByEmail?: string | null;
  expiresAt?: string | null;
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
    const response = await apiClient.get<BankAccount>(`/bank-accounts/by-id/${id}`);
    return response.data;
  }

  async create(data: {
    userId: string;
    bankId: string;
    cbu: string;
    alias: string;
    accountType: string;
    initialLimitAmount?: number;
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

  async getRequisiteV2(): Promise<GetRequisiteV2Response> {
    const response = await apiClient.get<GetRequisiteV2Response>('/bank-accounts/requisite-v2');
    return response.data;
  }

  async getRequisiteV3(): Promise<GetRequisiteV2Response> {
    const response = await apiClient.get<GetRequisiteV2Response>('/bank-accounts/requisite-v3');
    return response.data;
  }

  async searchNeoBanksV3(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchNeoBanksV3Response> {
    const response = await apiClient.get<SearchNeoBanksV3Response>('/bank-accounts/requisite-v3/neo-banks', {
      params,
    });
    return response.data;
  }

  async reserveRequisiteV3(bankAccountId: number): Promise<ReserveRequisiteV3Response> {
    const response = await apiClient.post<ReserveRequisiteV3Response>('/bank-accounts/requisite-v3/reserve', {
      bankAccountId,
    });
    return response.data;
  }

  async releaseRequisiteV3(params: { bankAccountId: number; reservationToken: string }): Promise<ReleaseRequisiteV3Response> {
    const response = await apiClient.post<ReleaseRequisiteV3Response>('/bank-accounts/requisite-v3/release', params);
    return response.data;
  }

  async getReservationStatusV3(bankAccountId: number): Promise<GetReservationStatusV3Response> {
    const response = await apiClient.get<GetReservationStatusV3Response>('/bank-accounts/requisite-v3/reservation-status', {
      params: { bankAccountId },
    });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/bank-accounts/${id}`);
  }
}

export const bankAccountsService = new BankAccountsService();
