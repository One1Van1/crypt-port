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

class CashWithdrawalsService {
  async withdraw(data: WithdrawCashDto): Promise<CashWithdrawal> {
    const response = await apiClient.post('/cash-withdrawals/withdraw', data);
    return response.data;
  }

  async convertToUsdt(id: number, data: ConvertToUsdtDto): Promise<PesoToUsdtConversion> {
    const response = await apiClient.post(`/cash-withdrawals/${id}/convert-to-usdt`, data);
    return response.data;
  }

  async getAll(): Promise<CashWithdrawal[]> {
    // Пока нет endpoint для получения списка, вернем пустой массив
    // TODO: добавить endpoint на бэкенде
    return [];
  }
}

export const cashWithdrawalsService = new CashWithdrawalsService();
export default cashWithdrawalsService;
