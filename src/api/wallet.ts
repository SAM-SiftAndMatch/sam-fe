import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';
import type { WalletLedgerEntry, WalletSummary } from '../types/wallet';

export const walletApi = {
  getMyWallet: async (): Promise<WalletSummary> => {
    const res = await apiClient.get<ApiResponse<WalletSummary>>('/wallets/me');
    return requireApiResult(res.data, 'Không tải được ví thử nghiệm');
  },

  getMyTransactions: async (): Promise<WalletLedgerEntry[]> => {
    const res = await apiClient.get<ApiResponse<WalletLedgerEntry[]>>('/wallets/me/transactions');
    return requireApiResult(res.data, 'Không tải được lịch sử ví thử nghiệm');
  },
};

export default walletApi;
