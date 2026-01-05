import { apiClient } from './api';

export interface GeneralAnalytics {
  totalWithdrawn: number;
  currentBalance: number;
  totalEarnings: number;
  totalOperators: number;
  activeShifts: number;
  totalWithdrawnFromBanks: number;
  trend: {
    date: string;
    deposits: number;
    withdrawals: number;
  }[];
}

export interface OperatorWithdrawalData {
  id: number;
  name: string;
  totalTransactions: number;
  completedTransactions: number;
  withdrawnAmount: number;
  withdrawalRate: number;
  bankId: number | null;
  inProcessAmount: number;
  status: string;
  convertedAmount: number;
  conversionRate: number;
}

export interface OperatorsWithdrawalsResponse {
  operators: OperatorWithdrawalData[];
}

export const analyticsService = {
  getGeneral: async (): Promise<GeneralAnalytics> => {
    const response = await apiClient.get('/analytics/general');
    return response.data;
  },

  getOperators: async () => {
    const response = await apiClient.get('/analytics/operators');
    return response.data;
  },

  getOperatorsWithdrawals: async (): Promise<OperatorsWithdrawalsResponse> => {
    const response = await apiClient.get('/analytics/operators-withdrawals');
    return response.data;
  },
};
