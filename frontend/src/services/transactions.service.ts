import { apiClient } from './api';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Transaction {
  id: string;
  bankAccountId: string;
  amount: number;
  amountUSDT?: number;
  exchangeRate?: number;
  status: TransactionStatus;
  receipt?: string;
  comment?: string;
  // Source neo-bank
  sourceDropNeoBank?: {
    id: number;
    provider: string;
    accountId: string;
    drop: {
      id: number;
      name: string;
    };
  };
  // Target bank account
  bankAccount?: {
    id: string;
    cbu: string;
    alias: string;
    bank?: {
      name: string;
    };
    drop?: {
      id: number;
      name: string;
    };
  };
  // Platform
  platform?: {
    id: number;
    name: string;
    exchangeRate: number;
  };
  // Shift and User
  shift?: {
    id: string;
    platformId: number;
    platform?: {
      name: string;
    };
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetTransactionsResponse {
  items: Transaction[];
  total: number;
}

export interface CreateTransactionRequest {
  amount: number;
  sourceDropNeoBankId: number;
  receipt?: string;
  comment?: string;
}

export interface CreateTransactionResponse {
  transaction: Transaction;
  updatedBankAccount: {
    withdrawnAmount: number;
    availableAmount: number;
    status: string;
  };
}

class TransactionsService {
  // Получить мои транзакции (для оператора)
  async getMy(params?: {
    page?: number;
    limit?: number;
    shiftId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<GetTransactionsResponse> {
    console.log('🔍 transactionsService.getMy called');
    const response = await apiClient.get<GetTransactionsResponse>('/transactions/my', { params });
    console.log('📋 getMy response:', response.data);
    return response.data;
  }

  // Получить мои транзакции (детальный эндпоинт для тимлида/админа)
  async getMyTransactions(params?: {
    status?: string;
    platformId?: number;
    shiftId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<GetTransactionsResponse> {
    console.log('🔍 transactionsService.getMyTransactions called');
    const response = await apiClient.get<GetTransactionsResponse>('/transactions/my-transactions', { params });
    console.log('📋 getMyTransactions response:', response.data);
    return response.data;
  }

  // Получить список банков из моих транзакций
  async getMyBanks(): Promise<{ items: { id: string; name: string }[] }> {
    const response = await apiClient.get<{ items: { id: string; name: string }[] }>('/transactions/my-banks');
    return response.data;
  }

  // Получить все транзакции (для админа/тимлида)
  async getAll(params?: {
    page?: number;
    limit?: number;
    operatorId?: string;
    status?: string;
    type?: string;
  }): Promise<GetTransactionsResponse> {
    console.log('🔍 transactionsService.getAll called');
    const response = await apiClient.get<GetTransactionsResponse>('/transactions', { params });
    console.log('📋 getAll response:', response.data);
    return response.data;
  }

  // Создать транзакцию (вывод)
  async create(data: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    const response = await apiClient.post<CreateTransactionResponse>('/transactions', data);
    return response.data;
  }

  // Получить транзакцию по ID
  async getById(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`);
    return response.data;
  }

  // Обновить статус транзакции
  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    const response = await apiClient.patch<Transaction>(`/transactions/${id}/status`, { status });
    return response.data;
  }
}

export const transactionsService = new TransactionsService();
