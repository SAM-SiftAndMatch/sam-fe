import apiClient from '../lib/axios';
import { tokenManager } from '../lib/token-manager';
import type { ApiResponse } from '../types/api';
import type { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    const auth = res.data.result;
    if (!auth) {
      throw new Error(res.data.message || 'Login failed');
    }
    tokenManager.setToken(auth.accessToken);
    return auth;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const auth = res.data.result;
    if (!auth) {
      throw new Error(res.data.message || 'Registration failed');
    }
    tokenManager.setToken(auth.accessToken);
    return auth;
  },

  refresh: async (): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh');
    const auth = res.data.result;
    if (!auth) {
      throw new Error(res.data.message || 'Token refresh failed');
    }
    tokenManager.setToken(auth.accessToken);
    return auth;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>('/auth/logout');
    } finally {
      tokenManager.clearToken();
    }
  },

  getMe: async (): Promise<CurrentUser> => {
    const res = await apiClient.get<ApiResponse<CurrentUser>>('/auth/me');
    if (!res.data.result) {
      throw new Error(res.data.message || 'Failed to fetch user');
    }
    return res.data.result;
  },
};

export default authApi;
