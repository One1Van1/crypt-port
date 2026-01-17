import { apiClient } from './api';

export interface DistributeFreeUsdtRequest {
  platformId: number;
  amountUsdt: number;
  comment?: string;
}

export interface DistributeFreeUsdtResponse {
  distributionId: number;
  platformId: number;
  amountUsdt: number;
  platformBalanceAfter: number;
  distributedByUserId: number;
  createdAt: string;
}

export interface FreeUsdtDistributionHistoryItem {
  id: number;
  platformId: number;
  platformName: string;
  amountUsdt: number;
  distributedByUserId: number;
  distributedByUserName: string;
  comment: string | null;
  createdAt: string;
}

export interface GetFreeUsdtDistributionsResponse {
  items: FreeUsdtDistributionHistoryItem[];
  total: number;
}

export interface MintFreeUsdtRequest {
  amountUsdt: number;
}

export interface MintFreeUsdtResponse {
  adjustmentId: number;
  amountUsdt: number;
  reason: string;
  createdByUserId: number;
  createdAt: string;
}

class FreeUsdtService {
  async distribute(dto: DistributeFreeUsdtRequest): Promise<DistributeFreeUsdtResponse> {
    const response = await apiClient.post<DistributeFreeUsdtResponse>('/free-usdt/distribute', dto);
    return response.data;
  }

  async mint(dto: MintFreeUsdtRequest): Promise<MintFreeUsdtResponse> {
    const response = await apiClient.post<MintFreeUsdtResponse>('/free-usdt/mint', dto);
    return response.data;
  }

  async getDistributions(params?: { page?: number; limit?: number }): Promise<GetFreeUsdtDistributionsResponse> {
    const response = await apiClient.get<GetFreeUsdtDistributionsResponse>('/free-usdt/distributions', { params });
    return response.data;
  }
}

export const freeUsdtService = new FreeUsdtService();
