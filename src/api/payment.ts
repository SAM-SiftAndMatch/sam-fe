import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';
import type {
  AmountVerification,
  ConfirmFundingRequest,
  CreateEscrowRequest,
  FundingStatus,
  PaymentResponse,
} from '../types/payment';

export const paymentApi = {
  // Client nạp 100% giá trị hợp đồng (trả về vnpayUrl để redirect)
  createFund: async (data: CreateEscrowRequest): Promise<PaymentResponse> => {
    const res = await apiClient.post<ApiResponse<PaymentResponse>>('/payments/fund', data);
    return requireApiResult(res.data, 'Failed to create fund payment');
  },

  // Freelancer đặt cọc cam kết 2%
  createDeposit: async (data: CreateEscrowRequest): Promise<PaymentResponse> => {
    const res = await apiClient.post<ApiResponse<PaymentResponse>>('/payments/deposit', data);
    return requireApiResult(res.data, 'Failed to create deposit payment');
  },

  getFundingStatus: async (contractId: string): Promise<FundingStatus> => {
    const res = await apiClient.get<ApiResponse<FundingStatus>>(`/payments/funding/${contractId}`);
    return requireApiResult(res.data, 'Failed to fetch funding status');
  },

  // FE tự báo đã chuyển sau redirect VNPay (giống confirm-payment của mua gói)
  confirmPayment: async (
    paymentId: string,
    data: ConfirmFundingRequest
  ): Promise<PaymentResponse> => {
    const res = await apiClient.post<ApiResponse<PaymentResponse>>(
      `/payments/${paymentId}/confirm`,
      data
    );
    return requireApiResult(res.data, 'Failed to confirm payment');
  },

  verifyAmount: async (contractId: string): Promise<AmountVerification> => {
    const res = await apiClient.post<ApiResponse<AmountVerification>>(
      `/payments/contracts/${contractId}/verify-amount`
    );
    return requireApiResult(res.data, 'Failed to verify amount');
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
