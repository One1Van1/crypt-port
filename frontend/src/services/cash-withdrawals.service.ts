import { apiClient } from './api';

export interface CashWithdrawal {
  id: number;
  amountPesos: number;
  bankAccountId: number;
  withdrawalRate: number;
  status: 'pending' | 'converted';
  withdrawnByUserId: number;
  withdrawnByUser?: {
    id: number;
    username: string;
  };
  comment?: string;
  createdAt: string;
  conversion?: PesoToUsdtConversion;
}

export interface PesoToUsdtConversion {
  id: number;
  pesosAmount: number;
  exchangeRate: number;
  usdtAmount: number;
  convertedByUserId: number;
  convertedByUser?: {
    id: number;
    username: string;
  };
  cashWithdrawalId: number;
  createdAt: string;
}

export interface WithdrawCashDto {
  bankAccountId: number;
  amountPesos: number;
  comment?: string;
}

export interface ConvertToUsdtDto {
  exchangeRate: number;
}

export interface DirectConvertDto {
  amountPesos: number;
  exchangeRate: number;
  comment?: string;
}

export interface DirectConvertResponse {
  id: number;
  pesosAmount: number;
  exchangeRate: number;
  usdtAmount: number;
  convertedByUserId: number;
  createdAt: string;
}

export interface UserInfo {
  id: number;
  username: string;
}

export interface ConversionItem {
  id: number;
  pesosAmount: number;
  exchangeRate: number;
  usdtAmount: number;
  status: 'pending' | 'confirmed';
  convertedByUser: UserInfo;
  withdrawnByUser?: UserInfo;
  createdAt: string;
}

export interface GetAllConversionsResponse {
  conversions: ConversionItem[];
}

export interface WithdrawalItem {
  id: string;
  amountPesos: number;
  withdrawalRate: number;
  status: 'pending' | 'converted';
  bankAccountId: number;
  comment?: string;
  createdAt: string;
  withdrawnByUser: {
    id: string;
    username: string;
  } | null;
}

export interface GetAllWithdrawalsResponse {
  items: WithdrawalItem[];
}

class CashWithdrawalsService {
  async withdraw(data: WithdrawCashDto): Promise<CashWithdrawal> {
    const response = await apiClient.post('/cash-withdrawals/withdraw', data);
    return response.data;
  }

  async convertToUsdt(id: number, data: ConvertToUsdtDto): Promise<PesoToUsdtConversion> {
    const response = await apiClient.post(`/cash-withdrawals/${id}/convert-to-usdt`, data);
    return response.data;
  }

  async directConvert(data: DirectConvertDto): Promise<DirectConvertResponse> {
    const response = await apiClient.post('/cash-withdrawals/direct-convert', data);
    return response.data;
  }

  async getAllConversions(): Promise<GetAllConversionsResponse> {
    const response = await apiClient.get('/cash-withdrawals/conversions');
    return response.data;
  }

  async confirmConversion(id: number): Promise<void> {
    await apiClient.patch(`/cash-withdrawals/conversions/${id}/confirm`);
  }

  async getAllWithdrawals(date?: string): Promise<GetAllWithdrawalsResponse> {
    const params = date ? { date } : {};
    const response = await apiClient.get('/cash-withdrawals/all', { params });
    return response.data;
  }

  async getAll(): Promise<CashWithdrawal[]> {
    // Deprecated: use getAllWithdrawals instead
    const response = await this.getAllWithdrawals();
    return response.items as any;
  }
}

export const cashWithdrawalsService = new CashWithdrawalsService();
export default cashWithdrawalsService;
