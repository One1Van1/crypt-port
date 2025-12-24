import { apiClient } from './api';
import { UserRole } from '../types/user.types';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole | string;  // Backend returns string, but it should be UserRole value
  phone?: string;
  telegram?: string;
  createdAt: string;
  updatedAt: string;
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
}

export const usersService = new UsersService();
