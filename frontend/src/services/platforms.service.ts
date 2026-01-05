import { apiClient } from './api';

export interface Platform {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  exchangeRate: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllPlatformsResponse {
  items: Platform[];
  total: number;
}

class PlatformsService {
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<GetAllPlatformsResponse> {
    const response = await apiClient.get<GetAllPlatformsResponse>('/platforms', { params });
    return response.data;
  }

  async getById(id: number): Promise<Platform> {
    const response = await apiClient.get<Platform>(`/platforms/${id}`);
    return response.data;
  }

  async updateRate(id: number, exchangeRate: number): Promise<Platform> {
    const response = await apiClient.patch<Platform>(`/platforms/${id}/rate`, { exchangeRate });
    return response.data;
  }

  async create(data: { name: string; exchangeRate?: number }): Promise<Platform> {
    const response = await apiClient.post<Platform>('/platforms', data);
    return response.data;
  }

  async update(id: number, data: { name?: string; exchangeRate?: number; balance?: number }): Promise<Platform> {
    const response = await apiClient.patch<Platform>(`/platforms/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/platforms/${id}`);
  }
}

export const platformsService = new PlatformsService();
