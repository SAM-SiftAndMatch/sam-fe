import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse, PageResult } from '../types/api';

export interface CursorResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
import type { JobStatus } from '../types/job';
import type { ContractStatus } from './contract';

export interface ChatRoom {
  id: string;
  jobId: string;
  jobTitle: string;
  jobStatus: JobStatus;
  contractStatus?: ContractStatus | null;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  createdAt?: string | null;
}

export interface ChatAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface SendChatMessage {
  content: string;
  attachmentIds?: string[];
  clientMessageId: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId?: string | null;
  senderName?: string | null;
  content: string;
  createdAt?: string | null;
  system?: boolean | null;
  attachments?: ChatAttachment[];
}

export const chatApi = {
  sendMessage: async (roomId: string, input: SendChatMessage): Promise<ChatMessage> => {
    const res = await apiClient.post<ApiResponse<ChatMessage>>(
      `/chat/rooms/${roomId}/messages`,
      input
    );
    return requireApiResult(res.data, 'Không gửi được tin nhắn. Vui lòng thử lại.');
  },
  uploadAttachment: async (
    roomId: string,
    file: File,
    signal?: AbortSignal
  ): Promise<ChatAttachment> => {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post<ApiResponse<ChatAttachment>>(
      `/chat/rooms/${roomId}/attachments`,
      form,
      { signal, headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return requireApiResult(res.data, 'Không tải được tệp đính kèm.');
  },
  getAttachmentBlob: async (
    roomId: string,
    attachmentId: string,
    signal?: AbortSignal
  ): Promise<Blob> => {
    const res = await apiClient.get<Blob>(
      `/chat/rooms/${roomId}/attachments/${attachmentId}/content`,
      { responseType: 'blob', signal }
    );
    return res.data;
  },
  unreadCount: async (): Promise<number> => {
    const res = await apiClient.get<ApiResponse<number>>('/chat/unread-count');
    return requireApiResult(res.data, 'Failed to fetch unread message count');
  },
  markRoomRead: async (roomId: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/chat/rooms/${roomId}/read`);
  },
  getMyRoomsPage: async (
    params: { page?: number; size?: number; search?: string } = {}
  ): Promise<PageResult<ChatRoom>> => {
    const res = await apiClient.get<ApiResponse<PageResult<ChatRoom>>>('/chat/rooms/page', {
      params,
    });
    return requireApiResult(res.data, 'Failed to fetch chat rooms');
  },

  getHistoryPage: async (
    roomId: string,
    params: { size?: number; before?: string } = {}
  ): Promise<CursorResult<ChatMessage>> => {
    const res = await apiClient.get<ApiResponse<CursorResult<ChatMessage>>>(
      `/chat/rooms/${roomId}/messages/page`,
      { params }
    );
    return requireApiResult(res.data, 'Failed to fetch messages');
  },
  getRoomDetail: async (roomId: string): Promise<ChatRoom> => {
    const res = await apiClient.get<ApiResponse<ChatRoom>>(`/chat/rooms/${roomId}`);
    return requireApiResult(res.data, 'Failed to fetch chat room');
  },

  getRoomByJob: async (jobId: string): Promise<ChatRoom> => {
    const res = await apiClient.get<ApiResponse<ChatRoom>>(`/chat/by-job/${jobId}`);
    return requireApiResult(res.data, 'Failed to fetch chat room');
  },

  getRoomByContract: async (contractId: string): Promise<ChatRoom> => {
    const res = await apiClient.get<ApiResponse<ChatRoom>>(`/chat/by-contract/${contractId}`);
    return requireApiResult(res.data, 'Failed to fetch chat room');
  },
};

export default chatApi;
