import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';

export interface RevenueEntry {
  id: string;
  createdAt: string;
  amount: number;
  source: 'PACKAGE' | 'PROJECT' | 'ADDON' | 'OTHER';
  title: string;
  description: string;
  projectId?: string;
  projectTitle?: string;
  packageName?: string;
  payerName?: string;
  payerEmail?: string;
  checkoutId?: string;
  contractId?: string;
}
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'CLIENT' | 'FREELANCER' | 'ADMIN';
  isActive: boolean;
  createdAt?: string;
}
export interface AdminOverview {
  timezone: string;
  currency: string;
  asOf: string;
  users: { total: number; clients: number; freelancers: number; admins: number; active: number };
  operations: {
    projects: number;
    activeProjects: number;
    openCases: number;
    pendingWithdrawals: number;
  };
  revenue: { total: number; monthTotal: number; entries: number };
  recentRevenue: RevenueEntry[];
  recentUsers: AdminUser[];
}
export interface RevenueReport {
  from: string;
  to: string;
  timezone: string;
  currency: string;
  totals: {
    count: number;
    total: number;
    packages: number;
    projects: number;
    addons: number;
    other: number;
  };
  series: { day: string; amount: number; count: number }[];
  items: RevenueEntry[];
  page: number;
  size: number;
}
export interface AdminUsers {
  total: number;
  items: AdminUser[];
  page: number;
  size: number;
}
async function get<T>(path: string) {
  return requireApiResult(
    (await apiClient.get<ApiResponse<T>>(path)).data,
    'Chưa tải được dữ liệu quản trị'
  );
}
export const adminApi = {
  overview: () => get<AdminOverview>('/admin/dashboard'),
  revenue: (params: URLSearchParams) => get<RevenueReport>(`/admin/revenue?${params}`),
  users: (params: URLSearchParams) => get<AdminUsers>(`/admin/users?${params}`),
};
