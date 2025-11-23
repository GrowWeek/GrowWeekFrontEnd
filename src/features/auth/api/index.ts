import { apiClient } from '@/lib/api-client';
import { LoginRequest, RegisterRequest, AuthResponse, UserResponse, LoginResponse } from '../types';

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', data);
  return (response as unknown as AuthResponse).data;
};

export const register = async (data: RegisterRequest): Promise<UserResponse> => {
  const response = await apiClient.post<UserResponse>('/api/v1/auth/register', data);
  return response as unknown as UserResponse;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/api/v1/auth/logout');
};

export const getMe = async (): Promise<UserResponse> => {
  const response = await apiClient.get<UserResponse>('/api/v1/auth/me');
  return response as unknown as UserResponse;
};

