export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface PurchaseSubscriptionRequest {
  packageId: string;
  projectId?: string | null;
}

export interface UserSubscriptionResponse {
  id: string;
  packageId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string | null;
  targetProjectId?: string | null;
  vnpayUrl?: string | null;
}
