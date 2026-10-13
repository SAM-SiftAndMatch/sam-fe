export type WalletEntryType = 'PROJECT_PAYOUT' | 'SECURITY_DEPOSIT_REFUND' | 'PLATFORM_COMMISSION';

export interface WalletSummary {
  walletId: string;
  currency: string;
  availableBalance: number;
  sandbox: boolean;
}

export interface WalletLedgerEntry {
  id: string;
  contractId: string;
  entryType: WalletEntryType;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}
