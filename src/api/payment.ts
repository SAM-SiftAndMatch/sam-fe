import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';
import type { CreateEscrowRequest, PaymentResponse } from '../types/payment';

export const paymentApi = {
  createEscrow: async (data: CreateEscrowRequest): Promise<PaymentResponse> => {
    const res = await apiClient.post<ApiResponse<PaymentResponse>>('/payments/escrow', data);
    return requireApiResult(res.data, 'Failed to create escrow payment');
  },

  getByContract: async (contractId: string): Promise<PaymentResponse[]> => {
    const res = await apiClient.get<ApiResponse<PaymentResponse[]>>(
      `/payments/contract/${contractId}`
    );
    return requireApiResult(res.data, 'Failed to fetch contract payments');
  },

  release: async (paymentId: string): Promise<PaymentResponse> => {
    const res = await apiClient.post<ApiResponse<PaymentResponse>>(
      `/payments/${paymentId}/release`
    );
    return requireApiResult(res.data, 'Failed to release escrow');
  },
};

export default paymentApi;
