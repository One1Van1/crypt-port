import { apiClient } from './api';

export interface ExchangeUsdtToPesosDto {
  platformId: number;
  neoBankId: number;
  usdtAmount: number;
}

export interface ExchangeUsdtToPesosResponse {
  id: number;
  platformId: number;
  platformName: string;
  neoBankId: number;
  neoBankProvider: string;
  usdtAmount: number;
  exchangeRate: number;
  pesosAmount: number;
  createdByUserId: number;
  createdAt: string;
}

export const exchangeUsdtToPesosService = {
  async exchange(dto: ExchangeUsdtToPesosDto): Promise<ExchangeUsdtToPesosResponse> {
    const response = await apiClient.post<ExchangeUsdtToPesosResponse>('/admin/exchange-usdt-to-pesos', dto);
    return response.data;
  },
};
