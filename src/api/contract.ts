import axios from 'axios';
import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';

export interface ContractDraft {
  contractId: string;
  jobId: string;
  agreedAmount: number;
  termsAndConditions: string;
}

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface ContractDetail {
  id: string;
  jobId: string;
  jobTitle: string;
  agreedAmount: number;
  termsAndConditions: string;
  status: ContractStatus;
  clientAgreed: boolean;
  freelancerAgreed: boolean;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  reviewStatus?: string | null;
  reviewNote?: string | null;
  clientKeepConfirmed?: boolean | null;
  freelancerKeepConfirmed?: boolean | null;
}

export interface ContractBroadcast {
  type: string;
  agreedAmount: number;
  termsAndConditions: string;
  clientAgreed: boolean;
  freelancerAgreed: boolean;
  contractStatus: ContractStatus;
  reviewStatus?: string | null;
  reviewNote?: string | null;
  clientKeepConfirmed?: boolean | null;
  freelancerKeepConfirmed?: boolean | null;
}

export interface ContractRevision {
  id: string;
  editorId: string;
  editorName: string;
  editorSide: 'CLIENT' | 'FREELANCER';
  agreedAmount: number;
  termsAndConditions: string;
  createdAt: string;
}

export const contractApi = {
  generateAiDraft: async (roomId: string): Promise<ContractDraft> => {
    const res = await apiClient.post<ApiResponse<ContractDraft>>(
      `/chat/rooms/${roomId}/contracts/ai-draft`
    );
    return requireApiResult(res.data, 'Failed to generate contract draft');
  },

  // 404 khi phòng chưa có hợp đồng — Workspace tự hiển thị CTA tạo mới
  getContractByRoom: async (roomId: string): Promise<ContractDetail> => {
    try {
      const res = await apiClient.get<ApiResponse<ContractDetail>>(
        `/chat/rooms/${roomId}/contract`
      );
      return requireApiResult(res.data, 'Failed to fetch contract');
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        throw new Error('NO_CONTRACT');
      }
      throw e;
    }
  },
  getRevisions: async (roomId: string): Promise<ContractRevision[]> => {
    const res = await apiClient.get<ApiResponse<ContractRevision[]>>(
      `/chat/rooms/${roomId}/contract/revisions`
    );
    return requireApiResult(res.data, 'Failed to fetch revisions');
  },
};

export default contractApi;
