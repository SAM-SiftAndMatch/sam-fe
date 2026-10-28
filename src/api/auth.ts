import apiClient from '../lib/axios';
import { tokenManager } from '../lib/token-manager';
import type { ApiResponse } from '../types/api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

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
  completeGoogle: async (role: 'CLIENT' | 'FREELANCER'): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/google/complete', {
      role,
      acceptedTerms: true,
    });
    const auth = res.data.result;
    if (!auth) throw new Error(res.data.message || 'Không hoàn tất được đăng ký Google');
    tokenManager.setToken(auth.accessToken);
    return auth;
  },
  linkGooglePending: async (password: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/google/link-pending', { password });
  },
  googleLinkStatus: async (): Promise<boolean> => {
    const res = await apiClient.get<ApiResponse<{ linked: boolean }>>('/auth/google/status');
    return res.data.result?.linked ?? false;
  },
  startGoogleLink: async (password: string): Promise<string> => {
    const res = await apiClient.post<ApiResponse<{ authorizationUrl: string }>>(
      '/auth/google/link/start',
      { password }
    );
    const url = res.data.result?.authorizationUrl;
    if (!url) throw new Error('Không bắt đầu được liên kết Google');
    return url;
  },
};

export default authApi;
