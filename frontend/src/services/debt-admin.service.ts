import { apiClient } from './api';

export type DebtOperationType = 'MANUAL_SET' | 'REPAYMENT_FROM_UNPAID_PESO_EXCHANGE';

export interface AdminDebtCurrent {
  id: number;
  amountUsdt: number;
}

export interface SetDebtRequest {
  amountUsdt: number;
  comment?: string;
}

export interface SetDebtResponse {
  id: number;
  amountUsdt: number;
}

export interface UpdateDebtRequest {
  amountUsdt: number;
  comment?: string;
}

export interface UpdateDebtResponse {
  id: number;
  amountUsdt: number;
  deltaUsdt: number;
}

export interface AdjustDebtRequest {
  amountUsdt: number;
  comment?: string;
}

export interface AdjustDebtResponse {
  id: number;
  amountUsdt: number;
  deltaUsdt: number;
}

export interface DebtOperationItem {
  id: number;
  createdAt: string;
  type: DebtOperationType;
  deltaUsdt: number;
  comment?: string | null;
  sourceConversionId?: number | null;
  createdByUserId?: number | null;
  createdByUserEmail?: string | null;
  createdByUserUsername?: string | null;
}

export interface GetDebtOperationsParams {
  page?: number;
  limit?: number;
  type?: DebtOperationType;
}

export interface GetDebtOperationsResponse {
  items: DebtOperationItem[];
  total: number;
  page: number;
  limit: number;
}

export const debtAdminService = {
  getCurrent: async (): Promise<AdminDebtCurrent> => {
    const response = await apiClient.get('/admin/debt');
    return response.data;
  },

  setDebt: async (dto: SetDebtRequest): Promise<SetDebtResponse> => {
    const response = await apiClient.post('/admin/debt', dto);
    return response.data;
  },

  updateDebt: async (id: number, dto: UpdateDebtRequest): Promise<UpdateDebtResponse> => {
    const response = await apiClient.patch(`/admin/debt/${id}`, dto);
    return response.data;
  },

  increase: async (dto: AdjustDebtRequest): Promise<AdjustDebtResponse> => {
    const response = await apiClient.post('/admin/debt/increase', dto);
    return response.data;
  },

  decrease: async (dto: AdjustDebtRequest): Promise<AdjustDebtResponse> => {
    const response = await apiClient.post('/admin/debt/decrease', dto);
    return response.data;
  },

  getOperations: async (params: GetDebtOperationsParams = {}): Promise<GetDebtOperationsResponse> => {
    const response = await apiClient.get('/admin/debt/operations', { params });
    return response.data;
  },
};
