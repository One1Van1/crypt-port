import { apiClient } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  tempToken: string;
  userId: number;
  message: string;
  requires2FA: boolean;
}

export interface Verify2FARequest {
  tempToken: string;
  code: string;
}

export interface Verify2FAResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'TEAMLEAD' | 'OPERATOR';
  message: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  message: string;
  tempToken: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  registerAdmin: async (data: RegisterRequest, masterKey: string): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register-admin', data, {
      params: { masterKey },
    });
    return response.data;
  },

  verify2FA: async (data: Verify2FARequest): Promise<Verify2FAResponse> => {
    const response = await apiClient.post('/auth/verify-2fa', data);
    return response.data;
  },

  getQRCode: async (tempToken: string): Promise<Blob> => {
    const response = await apiClient.get('/auth/qr-code', {
      params: { token: tempToken },
      responseType: 'blob',
    });
    return response.data;
  },
};
