import { apiClient } from './api';

export type ReturnedToSection = 'blocked_pesos' | 'unpaid_pesos';

export interface WithdrawProfitRequest {
  profitUsdtAmount: number;
  adminRate: number;
  returnedToSection: ReturnedToSection;
}

export interface WithdrawSimpleProfitRequest {
  profitUsdtAmount: number;
  adminRate: number;
}

export interface WithdrawProfitResponse {
  id: number;
  withdrawnUsdt: number;
  adminRate: number;
  globalRate: number;
  profitPesos: number;
  totalPesosReceived: number;
  returnedAmountPesos: number;
  returnedToSection: string;
  createdByUserId: number;
  createdAt: string;
}

export interface WithdrawSimpleProfitResponse {
  id: number;
  withdrawnUsdt: number;
  adminRate: number;
  profitPesos: number;
  createdByUserId: number;
  createdAt: string;
}

export interface ProfitHistoryItem {
  id: number;
  withdrawnUsdt: number;
  adminRate: number;
  profitPesos: number;
  returnedToSection: string;
  returnedAmountPesos: number;
  createdByUserId: number;
  createdByUserName: string;
  createdAt: string;
}

export interface GetProfitHistoryResponse {
  items: ProfitHistoryItem[];
  total: number;
}

export const profitsService = {
  getHistory: async (): Promise<GetProfitHistoryResponse> => {
    const response = await apiClient.get('/profits/history');
    return response.data;
  },

  withdraw: async (dto: WithdrawProfitRequest): Promise<WithdrawProfitResponse> => {
    const response = await apiClient.post('/profits/withdraw', dto);
    return response.data;
  },

  withdrawSimple: async (dto: WithdrawSimpleProfitRequest): Promise<WithdrawSimpleProfitResponse> => {
    const response = await apiClient.post('/profits/withdraw-simple-ledger', dto);
    return response.data;
  },
};
