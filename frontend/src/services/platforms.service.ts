import { apiClient } from './api';

export interface Platform {
  id: number;
  name: string;
  status: 'active' | 'inactive';
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
}

export const platformsService = new PlatformsService();
