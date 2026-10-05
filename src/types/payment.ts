export type PaymentInstallment = 'DEPOSIT' | 'FINAL';

export type PaymentStatus = 'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED' | 'REFUNDED';

export interface CreateEscrowRequest {
  contractId: string;
}

export interface PaymentResponse {
  paymentId: string;
  contractId: string;
  installment: PaymentInstallment;
  amount: number;
  currency: string;
  status: PaymentStatus;
  vnpayUrl?: string | null;
  escrowHeldAt?: string | null;
  releasedAt?: string | null;
}
