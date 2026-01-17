import { apiClient } from './api';
import type { ReserveProfitRequest, ReserveProfitResponse } from '../types/reserve-profit';

export interface PlatformBalance {
  id: number;
  name: string;
  balance: number;
  rate: number;
}

export interface Account {
  id: number;
  type: string;
  identifier: string;
  balance: number;
  platformId: number;
  platformName: string;
  rate: number;
  balanceUsdt: number;
}

export interface Conversion {
  id: number;
  pesosAmount: number;
  usdtAmount: number;
  exchangeRate: number;
  createdAt: string;
}

export interface Withdrawal {
  id: number;
  amountPesos: number;
  withdrawalRate: number;
  amountUsdt: number;
  status: string;
  createdAt: string;
}

export interface WorkingDepositSections {
  platformBalances: {
    total: number;
    platforms: PlatformBalance[];
  };
  blockedPesos: {
    totalPesos: number;
    totalUsdt: number;
    accounts: Account[];
  };
  unpaidPesos: {
    totalPesos: number;
    totalUsdt: number;
    accounts: Account[];
  };
  freeUsdt: {
    total: number;
    totalConverted: number;
    totalWithdrawn: number;
    conversions: Conversion[];
  };
  profitReserve: {
    totalUsdt: number;
  };
  deficit: {
    totalPesos: number;
    totalUsdt: number;
    withdrawals: Withdrawal[];
  };
  debt?: {
    totalUsdt: number;
    currentDebtUsdt: number;
    totalRepaidUsdt: number;
  };
  summary: {
    totalUsdt: number;
    initialDeposit: number;
    profit: number;
  };
}

export interface HistoryPoint {
  date: string;
  totalUsdt: number;
  initialDeposit: number;
  profit: number;
  platformBalances: number;
  blockedPesos: number;
  unpaidPesos: number;
  freeUsdt: number;
  deficit: number;
}

export interface WorkingDepositHistory {
  history: HistoryPoint[];
}

export interface DailyProfitPoint {
  date: string;
  totalUsdt: number;
  initialDeposit: number;
  profit: number;
}

export interface ProfitHistory {
  history: DailyProfitPoint[];
}

export type PesosAccountsDetailsKind = 'unpaid' | 'blocked';

export interface PesosAccountDetailsV1Item {
  id: number;
  type: string;
  identifier: string;
  bankName: string;
  dropName: string;
  balanceUsdt: number;
}

export interface GetPesosAccountsDetailsV1Response {
  items: PesosAccountDetailsV1Item[];
}

export const workingDepositService = {
  getSections: async (): Promise<WorkingDepositSections> => {
    const response = await apiClient.get('/working-deposit/sections-ledger');
    return response.data;
  },

  getSectionsV2: async (): Promise<WorkingDepositSections> => {
    const response = await apiClient.get('/working-deposit/sections-ledger-v3');
    return response.data;
  },

  getPesosAccountsDetailsV1: async (kind: PesosAccountsDetailsKind): Promise<GetPesosAccountsDetailsV1Response> => {
    const response = await apiClient.get('/working-deposit/pesos-accounts-details-v1', {
      params: { kind },
    });
    return response.data;
  },

  getHistory: async (days: number = 30): Promise<WorkingDepositHistory> => {
    const response = await apiClient.get('/working-deposit/history', {
      params: { days },
    });
    return response.data;
  },

  getProfitHistory: async (days: number = 30): Promise<ProfitHistory> => {
    const response = await apiClient.get('/working-deposit/profit-history', {
      params: { days },
    });
    return response.data;
  },

  setInitialDeposit: async (amount: number) => {
    const response = await apiClient.patch('/admin/settings/initial-deposit', {
      initialDeposit: amount,
    });
    return response.data;
  },

  reserveProfit: async (dto: ReserveProfitRequest = {}): Promise<ReserveProfitResponse> => {
    const response = await apiClient.post('/working-deposit/reserve-profit', dto);
    return response.data;
  },

  reserveProfitV2: async (dto: ReserveProfitRequest = {}): Promise<ReserveProfitResponse> => {
    const response = await apiClient.post('/working-deposit/reserve-profit-v2', dto);
    return response.data;
  },
};
