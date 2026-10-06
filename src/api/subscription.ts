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

  confirmPayment: async (subscriptionId: string): Promise<UserSubscriptionResponse> => {
    const res = await apiClient.post<ApiResponse<UserSubscriptionResponse>>(
      `/subscriptions/${subscriptionId}/confirm-payment`
    );
    return requireApiResult(res.data, 'Failed to confirm subscription payment');
  },

  mySubscriptions: async (): Promise<UserSubscriptionResponse[]> => {
    const res = await apiClient.get<ApiResponse<UserSubscriptionResponse[]>>('/subscriptions/me');
    return requireApiResult(res.data, 'Failed to fetch subscriptions');
  },
};

export default subscriptionApi;
