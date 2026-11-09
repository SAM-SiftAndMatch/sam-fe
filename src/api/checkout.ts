import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { Checkout } from '../lib/checkout';
import type { ApiResponse } from '../types/api';
export const checkoutApi = {
  retry: async (id: string) =>
    requireApiResult(
      (await apiClient.post<ApiResponse<Checkout>>(`/checkouts/${id}/retry`)).data,
      'Chưa thể tạo lại liên kết thanh toán'
    ),
  prepareRetry: async (id: string) =>
    requireApiResult(
      (await apiClient.post<ApiResponse<Checkout>>(`/checkouts/${id}/prepare-retry`)).data,
      'Chưa thể khôi phục thanh toán'
    ),
  get: async (id: string) =>
    requireApiResult(
      (await apiClient.get<ApiResponse<Checkout>>(`/checkouts/${id}`)).data,
      'Không tải được giao dịch'
    ),
  history: async (page = 0) =>
    requireApiResult(
      (await apiClient.get<ApiResponse<Checkout[]>>(`/checkouts/me?page=${page}`)).data,
      'Không tải được lịch sử'
    ),
};
