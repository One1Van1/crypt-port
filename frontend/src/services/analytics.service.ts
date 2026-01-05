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

export const analyticsService = {
  getGeneral: async (): Promise<GeneralAnalytics> => {
    const response = await apiClient.get('/analytics/general');
    return response.data;
  },

  getOperators: async () => {
    const response = await apiClient.get('/analytics/operators');
    return response.data;
  },
};
