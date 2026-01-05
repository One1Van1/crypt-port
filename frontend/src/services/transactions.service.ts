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
  amount: number;
  status: TransactionStatus;
  // Physical bank
  bank: {
    id: number;
    name: string;
  };
  // User who created transaction
  user: {
    id: number;
    username: string;
    email: string;
  };
  // Platform
  platform: {
    id: number;
    name: string;
  };
  // Withdrawal bank (Drop Neo Bank)
  dropNeoBank?: {
    id: number;
    provider: string;
    accountId: string;
  };
  // Bank account info
  bankAccount: {
    cbu: string;
  };
  createdAt: string;
}

export interface GetTransactionsResponse {
  items: Transaction[];
  total: number;
}

export interface CreateTransactionRequest {
  amount: number;
  sourceDropNeoBankId: number;
  bankAccountId: number;
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
    userId?: number;
    platformId?: number;
    bankId?: number;
    dropNeoBankId?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    status?: string;
  }): Promise<GetTransactionsResponse> {
    // Удаляем undefined значения
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, value]) => value !== undefined)
    );
    const response = await apiClient.get<GetTransactionsResponse>('/transactions', { 
      params: filteredParams 
    });
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
