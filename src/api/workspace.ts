import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';
import type { JobStatus } from '../types/job';
import type { ContractStatus } from './contract';

export interface WorkspaceSummary {
  roomId: string;
  jobId: string;
  jobTitle: string;
  jobStatus: JobStatus;
  selectedFreelancerId: string | null;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  contractId: string | null;
  contractStatus: ContractStatus | null;
  agreedAmount: number | null;
  reviewStatus: string | null;
}

export const workspaceApi = {
  getSummary: async (roomId: string): Promise<WorkspaceSummary> => {
    const response = await apiClient.get<ApiResponse<WorkspaceSummary>>(
      `/workspaces/${roomId}/summary`
    );
    return requireApiResult(response.data, 'Không tải được thông tin workspace');
  },
};
