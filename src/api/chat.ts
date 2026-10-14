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

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId?: string | null;
  senderName?: string | null;
  content: string;
  createdAt?: string | null;
  system?: boolean | null;
}

export const chatApi = {
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
  getMyRooms: async (): Promise<ChatRoom[]> => {
    const res = await apiClient.get<ApiResponse<ChatRoom[]>>('/chat/rooms');
    return requireApiResult(res.data, 'Failed to fetch chat rooms');
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
  getHistory: async (roomId: string): Promise<ChatMessage[]> => {
    const res = await apiClient.get<ApiResponse<ChatMessage[]>>(`/chat/rooms/${roomId}/messages`);
    return requireApiResult(res.data, 'Failed to fetch messages');
  },
};

export default chatApi;
