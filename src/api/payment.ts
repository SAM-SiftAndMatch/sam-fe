import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse, PageResult } from '../types/api';
import type {
  AmountVerification,
  ConfirmFundingRequest,
  CreateEscrowRequest,
  FreelancerEscrowSummary,
  FundingStatus,
  PaymentResponse,
} from '../types/payment';

export const paymentApi = {
  getByContractPage: async (
    contractId: string,
    page = 0,
    size = 10
  ): Promise<PageResult<PaymentResponse>> => {
    const res = await apiClient.get<ApiResponse<PageResult<PaymentResponse>>>(
      `/payments/contract/${contractId}/page`,
      { params: { page, size } }
    );
    return requireApiResult(res.data, 'Failed to fetch contract payments');
  },
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

  getFreelancerEscrowSummary: async (freelancerId: string): Promise<FreelancerEscrowSummary> => {
    const res = await apiClient.get<ApiResponse<FreelancerEscrowSummary>>(
      `/payments/freelancers/${freelancerId}/escrow-summary`
    );
    return requireApiResult(res.data, 'Failed to fetch freelancer escrow summary');
  },
};

export default paymentApi;
