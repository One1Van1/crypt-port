import { apiClient } from './api';
import { UserRole, UserStatus } from '../types/user.types';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole | string;  // Backend returns string, but it should be UserRole value
  status: UserStatus | string;  // Backend returns string, but it should be UserStatus value
  phone?: string;
  telegram?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  telegram?: string;
  role: string;
}

export interface GetUsersResponse {
  items: User[];
  total: number;
}

class UsersService {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<GetUsersResponse> {
    const response = await apiClient.get<GetUsersResponse>('/users', { params });
    return response.data;
  }

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  }

  async getProfile(id: string): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(`/users/profile/${id}`);
    return response.data;
  }

  async create(data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<User> {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  async updateRole(id: string, role: string): Promise<User> {
    const response = await apiClient.patch<User>(`/admin/users/${id}/role`, { role });
    return response.data;
  }

  async adminUpdate(id: string, data: Record<string, unknown>): Promise<User> {
    const response = await apiClient.patch<User>(`/admin/users/${id}`, data);
    return response.data;
  }

  async adminDelete(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  }

  async updateStatus(id: string, status: string): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, { status });
    return response.data;
  }
}

export const usersService = new UsersService();
