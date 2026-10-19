import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse, PageResult } from '../types/api';

export type InvitationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'WITHDRAWN'
  | 'EXPIRED'
  | 'SELECTED'
  | 'NOT_SELECTED';

export interface JobInvitation {
  id: string;
  jobId: string;
  jobTitle: string;
  jobStatus: string;
  freelancerId: string;
  freelancerName: string;
  source: 'DIRECT' | 'RECOMMENDATION' | 'PROPOSAL';
  status: InvitationStatus;
  message: string | null;
  roomId: string | null;
  expiresAt: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export interface ClientInvitationStatus {
  jobId: string;
  freelancerId: string;
  status: InvitationStatus;
}

export interface PublicFreelancer {
  userId: string;
  fullName: string;
  headline: string | null;
  bio: string | null;
  hourlyRate: number | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  skills: { skillId: number; skillName: string; yearsOfExperience: number | null }[];
}

export const invitationsApi = {
  freelancers: async (params: {
    page?: number;
    size?: number;
    search?: string;
    skillId?: number;
  }) =>
    requireApiResult(
      (
        await apiClient.get<ApiResponse<PageResult<PublicFreelancer>>>('/freelancers/page', {
          params,
        })
      ).data,
      'Không tải được danh sách freelancer'
    ),
  freelancer: async (id: string) =>
    requireApiResult(
      (await apiClient.get<ApiResponse<PublicFreelancer>>(`/freelancers/${id}`)).data,
      'Không tải được hồ sơ freelancer'
    ),
  invite: async (jobId: string, freelancerId: string, message?: string) =>
    requireApiResult(
      (
        await apiClient.post<ApiResponse<JobInvitation>>(`/jobs/${jobId}/invitations`, {
          freelancerId,
          message,
        })
      ).data,
      'Không gửi được lời mời'
    ),
  jobPage: async (
    jobId: string,
    params: { page?: number; size?: number; status?: InvitationStatus }
  ) =>
    requireApiResult(
      (
        await apiClient.get<ApiResponse<PageResult<JobInvitation>>>(
          `/jobs/${jobId}/invitations/page`,
          { params }
        )
      ).data,
      'Không tải được lời mời'
    ),
  clientFreelancerStatuses: async (freelancerIds: string[]) => {
    const query = new URLSearchParams();
    for (const id of freelancerIds) query.append('freelancerIds', id);
    return requireApiResult(
      (
        await apiClient.get<ApiResponse<ClientInvitationStatus[]>>(
          `/invitations/client/me/freelancer-statuses?${query.toString()}`
        )
      ).data,
      'Không tải được trạng thái lời mời'
    );
  },
  mine: async (params: { page?: number; size?: number; status?: InvitationStatus }) =>
    requireApiResult(
      (
        await apiClient.get<ApiResponse<PageResult<JobInvitation>>>('/invitations/me/page', {
          params,
        })
      ).data,
      'Không tải được lời mời'
    ),
  get: async (id: string) =>
    requireApiResult(
      (await apiClient.get<ApiResponse<JobInvitation>>(`/invitations/${id}`)).data,
      'Không tải được lời mời'
    ),
  accept: async (id: string) =>
    requireApiResult(
      (await apiClient.post<ApiResponse<JobInvitation>>(`/invitations/${id}/accept`)).data,
      'Không chấp nhận được lời mời'
    ),
  decline: async (id: string) =>
    requireApiResult(
      (await apiClient.post<ApiResponse<JobInvitation>>(`/invitations/${id}/decline`)).data,
      'Không từ chối được lời mời'
    ),
  withdraw: async (id: string) =>
    requireApiResult(
      (await apiClient.post<ApiResponse<JobInvitation>>(`/invitations/${id}/withdraw`)).data,
      'Không thu hồi được lời mời'
    ),
  select: async (jobId: string, invitationId: string) =>
    requireApiResult(
      (
        await apiClient.post<ApiResponse<JobInvitation>>(`/jobs/${jobId}/selection`, {
          invitationId,
        })
      ).data,
      'Không chọn được freelancer'
    ),
};
