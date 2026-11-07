export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface PurchaseSubscriptionRequest {
  packageId: string;
  projectId?: string | null;
  returnUrl?: string;
}

export interface UserSubscriptionResponse {
  id: string;
  packageId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string | null;
  targetProjectId?: string | null;
  checkout?: import('../lib/checkout').Checkout | null;
  environment: string;
  entitled: boolean;
}
