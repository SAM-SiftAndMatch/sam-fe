import { assertApiSuccess, requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse, PageResult } from '../types/api';
import type {
  AcceptProposalResponse,
  ProposalCreateRequest,
  ProposalResponse,
} from '../types/proposal';

export const proposalApi = {
  getMinePage: async (
    params: { page?: number; size?: number; status?: string } = {}
  ): Promise<PageResult<ProposalResponse>> => {
    const res = await apiClient.get<ApiResponse<PageResult<ProposalResponse>>>(
      '/proposals/me/page',
      { params }
    );
    return requireApiResult(res.data, 'Failed to fetch my proposals');
  },

  getByJobPage: async (
    jobId: string,
    params: { page?: number; size?: number; status?: string } = {}
  ): Promise<PageResult<ProposalResponse>> => {
    const res = await apiClient.get<ApiResponse<PageResult<ProposalResponse>>>(
      `/proposals/job/${jobId}/page`,
      { params }
    );
    return requireApiResult(res.data, 'Failed to fetch proposals');
  },
  submit: async (data: ProposalCreateRequest): Promise<ProposalResponse> => {
    const res = await apiClient.post<ApiResponse<ProposalResponse>>('/proposals', data);
    return requireApiResult(res.data, 'Failed to submit proposal');
  },

  getMineForJob: async (jobId: string): Promise<ProposalResponse> => {
    const res = await apiClient.get<ApiResponse<ProposalResponse>>(`/proposals/me/job/${jobId}`);
    return requireApiResult(res.data, 'Failed to fetch my proposal');
  },

  invite: async (proposalId: string): Promise<void> => {
    const res = await apiClient.post<ApiResponse<void>>(`/proposals/${proposalId}/invite`);
    assertApiSuccess(res.data, 'Failed to invite candidate');
  },

  accept: async (proposalId: string): Promise<AcceptProposalResponse> => {
    const res = await apiClient.post<ApiResponse<AcceptProposalResponse>>(
      `/proposals/${proposalId}/accept`
    );
    return requireApiResult(res.data, 'Failed to accept invitation');
  },

  reject: async (proposalId: string): Promise<void> => {
    const res = await apiClient.post<ApiResponse<void>>(`/proposals/${proposalId}/reject`);
    assertApiSuccess(res.data, 'Failed to reject proposal');
  },
};

export default proposalApi;
