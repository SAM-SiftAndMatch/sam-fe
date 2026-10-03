import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';
import type {
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
};

export default profileApi;
