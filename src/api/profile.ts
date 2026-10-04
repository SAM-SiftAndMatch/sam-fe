import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';
import type {
  ClientProfileRequest,
  ClientProfileResponse,
  FreelancerProfileRequest,
  FreelancerProfileResponse,
  SkillOption,
} from '../types/profile';

export const profileApi = {
  getFreelancerProfile: async (): Promise<FreelancerProfileResponse> => {
    const res =
      await apiClient.get<ApiResponse<FreelancerProfileResponse>>('/profiles/freelancer/me');
    if (!res.data.result) {
      throw new Error(res.data.message || 'Failed to fetch freelancer profile');
    }
    return res.data.result;
  },

  updateFreelancerProfile: async (
    data: FreelancerProfileRequest
  ): Promise<FreelancerProfileResponse> => {
    const res = await apiClient.put<ApiResponse<FreelancerProfileResponse>>(
      '/profiles/freelancer/me',
      data
    );
    if (!res.data.result) {
      throw new Error(res.data.message || 'Failed to update freelancer profile');
    }
    return res.data.result;
  },

  getSkills: async (search?: string): Promise<SkillOption[]> => {
    const res = await apiClient.get<ApiResponse<SkillOption[]>>('/skills', {
      params: search ? { search } : undefined,
    });
    return res.data.result || [];
  },

  getClientProfile: async (): Promise<ClientProfileResponse> => {
    const res = await apiClient.get<ApiResponse<ClientProfileResponse>>('/profiles/client/me');
    if (!res.data.result) {
      throw new Error(res.data.message || 'Failed to fetch client profile');
    }
    return res.data.result;
  },

  updateClientProfile: async (data: ClientProfileRequest): Promise<ClientProfileResponse> => {
    const res = await apiClient.put<ApiResponse<ClientProfileResponse>>(
      '/profiles/client/me',
      data
    );
    if (!res.data.result) {
      throw new Error(res.data.message || 'Failed to update client profile');
    }
    return res.data.result;
  },
};

export default profileApi;
