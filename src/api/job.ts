import { assertApiSuccess, requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';
import type {
  AcceptInvitationResponse,
  JobCreateRequest,
  JobResponse,
  RecommendationResponse,
} from '../types/job';

export const jobApi = {
  // PUBLIC: lấy tất cả OPEN jobs, sắp xếp mới nhất trước (không cần auth)
  getAllOpenJobs: async (): Promise<JobResponse[]> => {
    const res = await apiClient.get<ApiResponse<JobResponse[]>>('/jobs');
    return requireApiResult(res.data, 'Failed to fetch open jobs');
  },

  // JB-01: tạo job (BE tự gọi AI bóc skills; isUrgentHiring kích hoạt Headhunter)
  createJob: async (data: JobCreateRequest): Promise<JobResponse> => {
    const res = await apiClient.post<ApiResponse<JobResponse>>('/jobs', data);
    return requireApiResult(res.data, 'Failed to create job');
  },

  // JB-02: hủy job (chỉ OPEN; chủ job)
  cancelJob: async (jobId: string): Promise<JobResponse> => {
    const res = await apiClient.patch<ApiResponse<JobResponse>>(`/jobs/${jobId}/cancel`);
    return requireApiResult(res.data, 'Failed to cancel job');
  },

  // Lưu ý: BE yêu cầu Bearer (không public như mô tả spec cũ)
  getJobById: async (jobId: string): Promise<JobResponse> => {
    const res = await apiClient.get<ApiResponse<JobResponse>>(`/jobs/${jobId}`);
    return requireApiResult(res.data, 'Failed to fetch job');
  },

  // JB-03: jobs của client đang đăng nhập
  getMyJobs: async (): Promise<JobResponse[]> => {
    const res = await apiClient.get<ApiResponse<JobResponse[]>>('/jobs/client/me');
    return requireApiResult(res.data, 'Failed to fetch my jobs');
  },

  // JB-04: Top 5 AI đề xuất (chỉ chủ job)
  getRecommendations: async (jobId: string): Promise<RecommendationResponse[]> => {
    const res = await apiClient.get<ApiResponse<RecommendationResponse[]>>(
      `/jobs/${jobId}/recommendations`
    );
    return requireApiResult(res.data, 'Failed to fetch recommendations');
  },

  // Freelancer xem AI có recommend mình cho job này không
  getMyRecommendation: async (jobId: string): Promise<RecommendationResponse> => {
    const res = await apiClient.get<ApiResponse<RecommendationResponse>>(
      `/jobs/${jobId}/my-recommendation`
    );
    return requireApiResult(res.data, 'Failed to fetch my recommendation');
  },

  // JB-05: mời ứng viên (void — result null khi thành công nên chỉ check code)
  inviteCandidate: async (jobId: string, recId: string): Promise<void> => {
    const res = await apiClient.post<ApiResponse<void>>(
      `/jobs/${jobId}/recommendations/${recId}/invite`
    );
    assertApiSuccess(res.data, 'Failed to invite candidate');
  },

  // JB-06: freelancer chấp nhận → trả roomId để vào chat
  acceptInvitation: async (jobId: string, recId: string): Promise<AcceptInvitationResponse> => {
    const res = await apiClient.post<ApiResponse<AcceptInvitationResponse>>(
      `/jobs/${jobId}/recommendations/${recId}/accept`
    );
    return requireApiResult(res.data, 'Failed to accept invitation');
  },

  // JB-07: freelancer từ chối (void — chỉ check code)
  rejectInvitation: async (jobId: string, recId: string): Promise<void> => {
    const res = await apiClient.post<ApiResponse<void>>(
      `/jobs/${jobId}/recommendations/${recId}/reject`
    );
    assertApiSuccess(res.data, 'Failed to reject invitation');
  },

  // Freelancer chủ động claim job
  claimJob: async (jobId: string, recId: string): Promise<void> => {
    const res = await apiClient.post<ApiResponse<void>>(
      `/jobs/${jobId}/recommendations/${recId}/claim`
    );
    assertApiSuccess(res.data, 'Failed to claim job');
  },

  // Client chấp nhận yêu cầu claim từ Freelancer -> trả roomId để vào chat
  acceptFreelancerClaim: async (
    jobId: string,
    recId: string
  ): Promise<AcceptInvitationResponse> => {
    const res = await apiClient.post<ApiResponse<AcceptInvitationResponse>>(
      `/jobs/${jobId}/recommendations/${recId}/accept-claim`
    );
    return requireApiResult(res.data, 'Failed to accept freelancer claim');
  },
};

export default jobApi;
