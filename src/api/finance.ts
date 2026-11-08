import { isAxiosError } from 'axios';
import { extractApiResponse, requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';

export interface IncomeMonth {
  month: number;
  netIncome: number;
  grossIncome: number;
  platformFees: number;
  completedCount: number;
  sandboxNetIncome: number;
}
export interface FreelancerIncome {
  currency: string;
  timezone: string;
  year: number;
  totalNetIncome: number;
  totalGrossIncome: number;
  totalPlatformFees: number;
  completedCount: number;
  sandboxNetIncome: number;
  yearNetIncome: number;
  yearGrossIncome: number;
  yearPlatformFees: number;
  yearCompletedCount: number;
  yearSandboxNetIncome: number;
  months: IncomeMonth[];
}
export interface IncomeEntry {
  id: string;
  jobId: string;
  jobTitle: string;
  maintenanceOrderId?: string;
  acceptedAt: string;
  grossIncome: number;
  platformFees: number;
  netIncome: number;
}
export interface IncomeEntries {
  items: IncomeEntry[];
  page: number;
  size: number;
  totalElements: number;
  year: number;
}
export interface BankSetupStatus {
  status: 'READY' | 'PENDING' | 'ACTION_REQUIRED';
  hasVerifiedAccount: boolean;
  hasBankAccount: boolean;
  needsBankAccount: boolean;
  pendingCount: number;
}
export interface Payable {
  id: string;
  jobId: string;
  contractId: string;
  jobTitle: string;
  amount: number;
  earnings: number;
  depositRefund: number;
  reserved: number;
  paid: number;
  adjusted: number;
  sandbox: boolean;
  acceptedAt: string;
  availableAt: string;
  blocked: boolean;
}
export interface FinanceWallet {
  currency: string;
  availableBalance: number;
  pendingBalance: number;
  heldBalance: number;
  reservedBalance: number;
  paidTotal: number;
  sandboxBalance: number;
  escrowGross: number;
  lockedDeposit: number;
  withdrawalsEnabled: boolean;
  minimumWithdrawal: number;
  dailyWithdrawalLimit: number;
  payables: Payable[];
}
export interface BankAccount {
  id: string;
  ownerId: string;
  ownerName?: string;
  bankCode: string;
  lastFour: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'DISABLED';
  verificationNote?: string;
  createdAt: string;
}
export interface AuditEvent {
  actorId?: string;
  action: string;
  detail: string;
  createdAt: string;
}
export interface Withdrawal {
  id: string;
  ownerId: string;
  bankAccountId: string;
  bankCode: string;
  lastFour: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  operatorId?: string;
  bankReference?: string;
  evidenceReference?: string;
  history?: AuditEvent[];
}
export interface Beneficiary {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  amount?: number;
}
export interface Journal {
  grossAmount: number;
  payableChange: number;
  id: string;
  contractId?: string;
  description: string;
  amount?: number;
  sandbox: boolean;
  createdAt: string;
}
export interface MaintenanceSummary {
  acceptedAt: string;
  warrantyEndsAt: string;
  maintenanceStatus: string;
  openIssueCount: number;
  canCreateWarrantyTicket: boolean;
  canRequestPaidMaintenance: boolean;
  payoutBlocked: boolean;
  sandbox: boolean;
}
export interface TicketEvent {
  id: string;
  actorId?: string;
  action: string;
  content: string;
  createdAt: string;
}
export interface MaintenanceTicket {
  scopeId?: string;
  id: string;
  title: string;
  description: string;
  kind: 'WARRANTY' | 'PAID';
  status: string;
  createdAt: string;
  resolutionDueAt: string;
  responseDueAt: string;
  closedAt?: string;
  jobId?: string;
  jobTitle?: string;
  events?: TicketEvent[];
}
export const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
export const dateTime = (value: string) => new Date(value).toLocaleString('vi-VN');
export const financeError = (error: unknown) => {
  const message = extractApiResponse(error)?.message;
  if (message) return message;
  if (isAxiosError(error) && error.code === 'ECONNABORTED')
    return 'Chưa nhận được kết quả từ máy chủ. Hãy kiểm tra lịch sử trước khi gửi lại.';
  if (isAxiosError(error) && !error.response)
    return 'Không kết nối được máy chủ. Hãy kiểm tra kết nối và thử lại.';
  return error instanceof Error ? error.message : 'Không thực hiện được thao tác. Hãy thử lại.';
};
export async function financeGet<T>(path: string): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(path, { timeout: 15000 });
  return requireApiResult(response.data, 'Không tải được dữ liệu');
}
export async function financePost<T>(path: string, body: unknown = {}): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(path, body, { timeout: 20000 });
  return requireApiResult(response.data, 'Không thực hiện được thao tác');
}
export async function financePut<T>(path: string, body: unknown): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(path, body, { timeout: 20000 });
  return requireApiResult(response.data, 'Không cập nhật được thông tin');
}
export const financeApi = {
  income: (year?: number) =>
    financeGet<FreelancerIncome>(`/finance/income${year === undefined ? '' : `?year=${year}`}`),
  incomeEntries: (year: number, page = 0) =>
    financeGet<IncomeEntries>(`/finance/income/entries?year=${year}&page=${page}`),
  bankSetup: () => financeGet<BankSetupStatus>('/finance/bank-accounts/setup-status'),
  wallet: () => financeGet<FinanceWallet>('/finance/wallet'),
  banks: () => financeGet<BankAccount[]>('/finance/bank-accounts'),
  withdrawals: (page = 0) => financeGet<Withdrawal[]>(`/finance/withdrawals?page=${page}`),
  journals: (page = 0) => financeGet<Journal[]>(`/finance/transactions?page=${page}`),
  maintenance: (job: string) => financeGet<MaintenanceSummary>(`/projects/${job}/maintenance`),
  tickets: (job: string, page = 0) =>
    financeGet<MaintenanceTicket[]>(`/projects/${job}/maintenance-tickets?page=${page}`),
  ticket: (id: string, page = 0) =>
    financeGet<MaintenanceTicket>(`/maintenance-tickets/${id}?page=${page}`),
};
export const statusLabel: Record<string, string> = {
  REQUESTED: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  PROCESSING: 'Đang chuyển tiền',
  RECONCILIATION_REQUIRED: 'Đang đối soát',
  PAID: 'Đã chuyển ngân hàng',
  FAILED: 'Đã xác nhận thất bại',
  REJECTED: 'Bị từ chối',
  CANCELLED: 'Đã hủy',
  PENDING: 'Chờ xác minh',
  VERIFIED: 'Đã xác minh',
  DISABLED: 'Ngừng sử dụng',
  OPEN: 'Mới mở',
  IN_PROGRESS: 'Đang xử lý',
  WAITING_CLIENT: 'Chờ khách hàng',
  FIX_SUBMITTED: 'Chờ kiểm tra bản vá',
  DISPUTED: 'Cần admin hỗ trợ',
  RESOLVED: 'Đã giải quyết',
  OUT_OF_SCOPE: 'Ngoài phạm vi',
  WITHDRAWN: 'Đã rút ticket',
};
