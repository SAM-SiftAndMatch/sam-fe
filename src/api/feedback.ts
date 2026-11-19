import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse, PageResult } from '../types/api';
import type { UserRole } from '../types/auth';

export type FeedbackStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
export interface PlatformFeedback {
  id: string;
  rating: number;
  comment: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}
export interface AdminFeedback extends PlatformFeedback {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  adminNote: string;
  reviewedByName?: string;
  version: number;
}
export interface FeedbackSummary {
  total: number;
  averageRating: number;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
  ratings: { rating: number; count: number }[];
}

export const feedbackApi = {
  create: async (input: { rating: number; comment: string; requestKey: string }) =>
    requireApiResult(
      (await apiClient.post<ApiResponse<PlatformFeedback>>('/feedback', input)).data,
      'Không gửi được đánh giá.'
    ),
  mine: async (page: number) =>
    requireApiResult(
      (
        await apiClient.get<ApiResponse<PageResult<PlatformFeedback>>>(
          `/feedback/mine?page=${page}&size=10`
        )
      ).data,
      'Không tải được đánh giá của bạn.'
    ),
  adminList: async (params: URLSearchParams) =>
    requireApiResult(
      (await apiClient.get<ApiResponse<PageResult<AdminFeedback>>>(`/admin/feedback?${params}`))
        .data,
      'Không tải được danh sách đánh giá.'
    ),
  summary: async () =>
    requireApiResult(
      (await apiClient.get<ApiResponse<FeedbackSummary>>('/admin/feedback/summary')).data,
      'Không tải được thống kê đánh giá.'
    ),
  detail: async (id: string) =>
    requireApiResult(
      (await apiClient.get<ApiResponse<AdminFeedback>>(`/admin/feedback/${id}`)).data,
      'Không tải được chi tiết đánh giá.'
    ),
  update: async (
    id: string,
    input: { status: FeedbackStatus; adminNote: string; version: number }
  ) =>
    requireApiResult(
      (await apiClient.patch<ApiResponse<AdminFeedback>>(`/admin/feedback/${id}`, input)).data,
      'Không cập nhật được đánh giá.'
    ),
};
