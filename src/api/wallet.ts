import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse, PageResult } from '../types/api';
import type { WalletLedgerEntry, WalletSummary } from '../types/wallet';

export const walletApi = {
  getMyTransactionsPage: async (page = 0, size = 10): Promise<PageResult<WalletLedgerEntry>> => {
    const res = await apiClient.get<ApiResponse<PageResult<WalletLedgerEntry>>>(
      '/wallets/me/transactions/page',
      { params: { page, size } }
    );
    return requireApiResult(res.data, 'Không tải được lịch sử ví thử nghiệm');
  },
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
