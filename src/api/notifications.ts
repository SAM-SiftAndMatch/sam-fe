import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse, PageResult } from '../types/api';

export interface UserNotification {
  id: string;
  recipientUserId: string;
  actorUserId: string | null;
  actorName: string | null;
  type: string;
  jobId: string | null;
  jobTitle: string | null;
  matchScore: number | null;
  invitationId: string | null;
  roomId: string | null;
  contractId: string | null;
  paymentId: string | null;
  amount: number | null;
  subscriptionId: string | null;
  proposalId: string | null;
  recommendationId: string | null;
  message: string | null;
  createdAt: string;
  readAt: string | null;
  unreadCount: number;
}

export interface RecentNotifications {
  items: UserNotification[];
  unreadCount: number;
}

export const notificationsApi = {
  recent: async () =>
    requireApiResult(
      (await apiClient.get<ApiResponse<RecentNotifications>>('/notifications/recent')).data,
      'Không tải được thông báo'
    ),
  page: async (params: { page?: number; size?: number }) =>
    requireApiResult(
      (
        await apiClient.get<ApiResponse<PageResult<UserNotification>>>('/notifications/page', {
          params,
        })
      ).data,
      'Không tải được danh sách thông báo'
    ),
  markRead: async (id: string) => {
    await apiClient.post<ApiResponse<void>>(`/notifications/${id}/read`);
  },
  markAllRead: async () => {
    await apiClient.post<ApiResponse<void>>('/notifications/read-all');
  },
};
