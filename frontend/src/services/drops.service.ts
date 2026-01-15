import { apiClient } from './api';

export enum DropStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
}

export interface Drop {
  id: string;
  name: string;
  comment?: string;
  status: DropStatus;
  userId?: number;
  user?: {
    id: string;
    username: string;
    email: string;
  };
  bankAccounts?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface GetDropsResponse {
  items: Drop[];
  total: number;
}

class DropsService {
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<GetDropsResponse> {
    const response = await apiClient.get<GetDropsResponse>('/drops', { params });
    return response.data;
  }

  async getById(id: string): Promise<Drop> {
    const response = await apiClient.get<Drop>(`/drops/by-id/${id}`);
    return response.data;
  }

  async create(data: {
    name: string;
    comment?: string;
    userId?: number;
  }): Promise<Drop> {
    const response = await apiClient.post<Drop>('/drops', data);
    return response.data;
  }

  async update(id: string, data: {
    name?: string;
    comment?: string;
    userId?: number;
  }): Promise<Drop> {
    const response = await apiClient.patch<Drop>(`/drops/${id}`, data);
    return response.data;
  }

  async updateStatus(id: string, status: DropStatus): Promise<Drop> {
    const response = await apiClient.patch<Drop>(`/drops/${id}/status`, { status });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/drops/${id}`);
  }
}

export const dropsService = new DropsService();
