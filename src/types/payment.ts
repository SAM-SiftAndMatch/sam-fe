export type PaymentType = 'CONTRACT_FUND' | 'SECURITY_DEPOSIT';

export type PaymentStatus = 'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED' | 'REFUNDED' | 'EXPIRED';

export interface CreateEscrowRequest {
  contractId: string;
  returnUrl?: string;
}

export interface ConfirmFundingRequest {
  txnRef?: string | null;
  amountVnd?: number | null;
}

export interface PaymentResponse {
  paymentId: string;
  contractId: string;
  installment?: string | null;
  paymentType?: PaymentType | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  vnpayUrl?: string | null;
  escrowHeldAt?: string | null;
  releasedAt?: string | null;
}

export interface FundingStatus {
  contractId: string;
  jobId: string;
  jobStatus: string;
  agreedAmount: number;
  clientAmount: number;
  depositAmount: number;
  freelancerPayout: number;
  platformFee: number;
  fundStatus?: PaymentStatus | null;
  depositStatus?: PaymentStatus | null;
  fundPaid: boolean;
  depositPaid: boolean;
  allPaid: boolean;
}

export interface AmountVerification {
  extractedAmount?: number | null;
  matches?: boolean | null;
  note?: string | null;
}
