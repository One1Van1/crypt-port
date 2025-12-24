import { apiClient } from './api';

export interface Shift {
  id: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  totalAmount: number;
  operationsCount: number;
  status: 'active' | 'ended';
  operator: {
    id: string;
    username: string;
    email: string;
  };
  platform: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StartShiftRequest {
  platformId: number;
}

export interface GetAllShiftsResponse {
  items: Shift[];
  total: number;
}

class ShiftsService {
  async getMyCurrentShift(): Promise<Shift | null> {
    const response = await apiClient.get<Shift | null>('/shifts/my-current');
    return response.data;
  }

  async startShift(data: StartShiftRequest): Promise<Shift> {
    const response = await apiClient.post<Shift>('/shifts/start', data);
    return response.data;
  }

  async endShift(shiftId: number): Promise<Shift> {
    const response = await apiClient.post<Shift>(`/shifts/${shiftId}/end`);
    return response.data;
  }

  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<GetAllShiftsResponse> {
    const response = await apiClient.get<GetAllShiftsResponse>('/shifts', { params });
    return response.data;
  }

  async getById(id: number): Promise<Shift> {
    const response = await apiClient.get<Shift>(`/shifts/${id}`);
    return response.data;
  }
}

export const shiftsService = new ShiftsService();
