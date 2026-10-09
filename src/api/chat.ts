import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';

export interface ChatRoom {
  id: string;
  jobId: string;
  jobTitle: string;
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
