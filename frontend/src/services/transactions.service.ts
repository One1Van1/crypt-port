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
  operatorId: string;
  shiftId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  comment?: string;
  // Плоские поля от API
  bankName?: string;
  bankAccountCbu?: string;
  // Вложенные объекты (не всегда присутствуют)
  bankAccount?: {
    id: string;
    cbu: string;
    alias: string;
    bank?: {
      name: string;
    };
  };
  operator?: {
    username: string;
    email: string;
  };
  shift?: {
    id: string;
    platformId: number;
    platform?: {
      name: string;
    };
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
  platformId: number;
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
    const response = await apiClient.get<GetTransactionsResponse>('/transactions/my', { params });
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
    const response = await apiClient.get<GetTransactionsResponse>('/transactions', { params });
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
