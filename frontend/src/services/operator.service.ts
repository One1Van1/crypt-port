import { apiClient } from './api';

export interface BankAccountForOperator {
  id: number;
  cbu: string;
  alias: string;
  status: string;
  priority: number;
  limitAmount: number;
  withdrawnAmount: number;
  lastUsedAt: Date | null;
  dropName: string;
}

export interface OperatorBank {
  id: number;
  name: string;
  code: string | null;
  status: string;
  accounts: BankAccountForOperator[];
}

export interface OperatorBanksResponse {
  banks: OperatorBank[];
}

export interface BankForDrop {
  id: number;
  name: string;
  code: string | null;
}

export interface OperatorDrop {
  id: number;
  name: string;
  comment: string | null;
  status: string;
  accountsCount: number;
  banks: BankForDrop[];
}

export interface OperatorDropsResponse {
  drops: OperatorDrop[];
}

export interface TransactionForOperator {
  id: number;
  amount: number;
  amountUSDT: number | null;
  status: string;
  comment: string | null;
  bankAccountCbu: string;
  bankAccountAlias: string;
  dropName?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionsForOperatorResponse {
  items: TransactionForOperator[];
  total: number;
}

export const operatorService = {
  getMyBanks: async (): Promise<OperatorBanksResponse> => {
    const response = await apiClient.get('/banks/operator/my-banks');
    return response.data;
  },

  getMyDrops: async (): Promise<OperatorDropsResponse> => {
    const response = await apiClient.get('/drops/operator/my-drops');
    return response.data;
  },

  getBankTransactions: async (
    bankId: number,
    params?: { page?: number; limit?: number }
  ): Promise<TransactionsForOperatorResponse> => {
    const response = await apiClient.get(`/banks/${bankId}/transactions/operator`, {
      params,
    });
    return response.data;
  },

  getDropTransactions: async (
    dropId: number,
    params?: { page?: number; limit?: number }
  ): Promise<TransactionsForOperatorResponse> => {
    const response = await apiClient.get(`/drops/${dropId}/transactions/operator`, {
      params,
    });
    return response.data;
  },
};
