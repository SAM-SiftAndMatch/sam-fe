import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types/api';
import type { AuthResponse } from '../types/auth';
import { tokenManager } from './token-manager';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  for (const { resolve, reject } of failedQueue) {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  }
  failedQueue = [];
};

// Request interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Auto refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const responseCode = error.response?.data?.code;

    // Do not retry auth endpoints or already retried requests
    if (
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // Code 1016 = Security Alert: Token compromised
    if (responseCode === 1016) {
      tokenManager.clearToken();
      window.location.href = '/login?reason=compromised';
      return Promise.reject(error);
    }

    // 401 Unauthorized -> Attempt token refresh
    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh');
        const newToken = data.result?.accessToken;
        if (!newToken) {
          throw new Error('No access token returned from refresh');
        }

        tokenManager.setToken(newToken);
        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenManager.clearToken();
        // Redirect to login if refresh fails
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?reason=session_expired';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
