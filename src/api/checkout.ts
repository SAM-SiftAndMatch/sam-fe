import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { Checkout } from '../lib/checkout';
import type { ApiResponse } from '../types/api';
export const checkoutApi = {
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
