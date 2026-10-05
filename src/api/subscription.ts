import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';
import type { PurchaseSubscriptionRequest, UserSubscriptionResponse } from '../types/subscription';

export const subscriptionApi = {
  purchase: async (data: PurchaseSubscriptionRequest): Promise<UserSubscriptionResponse> => {
    const res = await apiClient.post<ApiResponse<UserSubscriptionResponse>>(
      '/subscriptions/purchase',
      data
    );
    return requireApiResult(res.data, 'Failed to purchase package');
  },

  mySubscriptions: async (): Promise<UserSubscriptionResponse[]> => {
    const res = await apiClient.get<ApiResponse<UserSubscriptionResponse[]>>('/subscriptions/me');
    return requireApiResult(res.data, 'Failed to fetch subscriptions');
  },
};

export default subscriptionApi;
