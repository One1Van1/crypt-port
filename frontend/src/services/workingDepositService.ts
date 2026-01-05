import { apiClient } from './api';

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
  deficit: {
    totalPesos: number;
    totalUsdt: number;
    withdrawals: Withdrawal[];
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

export const workingDepositService = {
  getSections: async (): Promise<WorkingDepositSections> => {
    const response = await apiClient.get('/working-deposit/sections');
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
};
