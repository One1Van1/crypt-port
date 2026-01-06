import { apiClient } from './api';

export interface PlatformExchangeItem {
  id: number;
  platformId: number;
  platformName: string;
  usdtAmount: number;
  exchangeRate: number;
  pesosAmount: number;
  createdAt: string;
}

export interface GetPlatformExchangesResponse {
  items: PlatformExchangeItem[];
  total: number;
}

class PlatformExchangesService {
  async getAll(params?: { page?: number; limit?: number; platformId?: number }): Promise<GetPlatformExchangesResponse> {
    const response = await apiClient.get<GetPlatformExchangesResponse>('/platforms/exchanges', { params });
    return response.data;
  }
}

export const platformExchangesService = new PlatformExchangesService();
