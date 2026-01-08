import { apiClient } from './api';

export type CreatableUserRole = 'operator' | 'teamlead';

export interface CreateUserWithQrRequest {
  username: string;
  email: string;
  password: string;
  role: CreatableUserRole;
}

export interface CreateUserWithQrResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  message: string;
  tempToken: string;
}

export const userRegistrationService = {
  createUserWithQr: async (data: CreateUserWithQrRequest): Promise<CreateUserWithQrResponse> => {
    const response = await apiClient.post<CreateUserWithQrResponse>('/users', data);
    return response.data;
  },
};
