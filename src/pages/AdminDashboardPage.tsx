import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  FileCheck2,
  Users,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { money } from '../api/finance';
import {
  AdminCard,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  adminDate,
  defaultPeriod,
} from '../components/admin/AdminUI';
import { RevenueSources, RevenueTrend } from '../components/admin/RevenueCharts';
import RevenueTable from '../components/admin/RevenueTable';
import { useAuthStore } from '../stores/useAuthStore';

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const overview = useQuery({
    queryKey: ['admin-overview', user?.userId],
    queryFn: adminApi.overview,
    refetchInterval: 60000,
  });
  const period = new URLSearchParams(defaultPeriod());
  const revenue = useQuery({
    queryKey: ['admin-revenue', user?.userId, period.toString()],
    queryFn: () => adminApi.revenue(period),
  });
  return (
    <div>
      <AdminPageHeader
        eyebrow="SAM CONTROL CENTER"
        title="Tổng quan nền tảng"
        description={`Chào ${user?.fullName || 'quản trị viên'}, đây là tình hình hoạt động và doanh thu đã ghi nhận của SAM.`}
        action={
          <Link
            to="/admin/revenue"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Báo cáo doanh thu
            <ArrowUpRight size={15} />
          </Link>
        }
      />
      {overview.isPending ? (
        <AdminLoading />
      ) : overview.isError ? (
        <AdminError retry={() => void overview.refetch()} />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Doanh thu tháng này',
                value: money(overview.data.revenue.monthTotal),
                detail: 'Theo thời điểm ghi sổ LIVE',
                icon: CircleDollarSign,
                color: 'bg-blue-50 text-blue-600',
              },
              {
                label: 'Tổng người dùng',
                value: overview.data.users.total.toLocaleString('vi-VN'),
                detail: `${overview.data.users.clients} client · ${overview.data.users.freelancers} freelancer`,
                icon: Users,
                color: 'bg-violet-50 text-violet-600',
              },
              {
                label: 'Hồ sơ cần xử lý',
                value: overview.data.operations.openCases.toLocaleString('vi-VN'),
                detail: 'Các sự cố thanh toán chưa kết thúc',
                icon: FileCheck2,
                color: 'bg-amber-50 text-amber-600',
              },
              {
                label: 'Tổng doanh thu',
                value: money(overview.data.revenue.total),
                detail: 'Không bao gồm tiền ký quỹ và demo',
                icon: Wallet,
                color: 'bg-teal-50 text-teal-600',
              },
            ].map((card) => (
              <div
                key={card.label}
                className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-500">{card.label}</p>
                  <span className={`rounded-xl p-2.5 ${card.color}`}>
                    <card.icon size={18} />
                  </span>
                </div>
                <p className="break-words text-2xl font-bold tracking-tight text-slate-950">
                  {card.value}
                </p>
                <p className="mt-2 text-[11px] leading-5 text-slate-400">{card.detail}</p>
              </div>
            ))}
          </div>
          <div className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(280px,1fr)]">
            <AdminCard
              title="Xu hướng doanh thu"
              action={<span className="text-[11px] text-slate-400">30 ngày gần nhất</span>}
            >
              {revenue.isPending ? (
                <div className="m-5 h-64 animate-pulse rounded-xl bg-slate-100" />
              ) : revenue.isError ? (
                <div className="p-5">
                  <AdminError retry={() => void revenue.refetch()} />
                </div>
              ) : (
                <RevenueTrend series={revenue.data.series} />
              )}
            </AdminCard>
            <AdminCard title="Cơ cấu doanh thu">
              {revenue.data ? (
                <RevenueSources totals={revenue.data.totals} />
              ) : (
                <div className="p-5 text-sm text-slate-400">
                  {revenue.isError ? 'Chưa tải được cơ cấu doanh thu' : 'Đang tải…'}
                </div>
              )}
            </AdminCard>
          </div>
          <AdminCard
            title="Doanh thu ghi nhận gần đây"
            action={
              <Link
                to="/admin/revenue"
                className="flex items-center gap-1 text-xs font-medium text-blue-600"
              >
                Xem tất cả
                <ArrowRight size={14} />
              </Link>
            }
          >
            <RevenueTable items={overview.data.recentRevenue} />
          </AdminCard>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <AdminCard
              title="Người dùng mới"
              action={
                <Link to="/admin/users" className="text-xs font-medium text-blue-600">
                  Quản lý danh sách
                </Link>
              }
            >
              <div className="divide-y divide-slate-100">
                {overview.data.recentUsers.length === 0 ? (
                  <p className="p-6 text-sm text-slate-400">Chưa có người dùng.</p>
                ) : (
                  overview.data.recentUsers.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 p-4 px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                          {item.fullName.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">{item.fullName}</p>
                          <p className="mt-1 truncate text-[11px] text-slate-400">{item.email}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-400">
                        {adminDate(item.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </AdminCard>
            <AdminCard title="Cần bạn quan tâm">
              <div className="space-y-3 p-5">
                {[
                  {
                    title: 'Sự cố thanh toán',
                    value: overview.data.operations.openCases,
                    to: '/admin/finance/payment-cases',
                  },
                  {
                    title: 'Yêu cầu chi trả đang chờ',
                    value: overview.data.operations.pendingWithdrawals,
                    to: '/admin/finance/withdrawals',
                  },
                  {
                    title: 'Người dùng đang hoạt động',
                    value: overview.data.users.active,
                    to: '/admin/users?status=ACTIVE',
                  },
                ].map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-4 text-xs hover:bg-blue-50"
                  >
                    <span className="text-slate-600">{item.title}</span>
                    <span className="flex items-center gap-3 font-semibold text-slate-900">
                      {item.value}
                      <ArrowRight size={14} className="text-slate-400" />
                    </span>
                  </Link>
                ))}
              </div>
            </AdminCard>
          </div>
          <p className="mt-5 text-right text-[11px] text-slate-400">
            Dữ liệu LIVE · Cập nhật{' '}
            {new Date(overview.data.asOf).toLocaleTimeString('vi-VN', {
              timeZone: 'Asia/Ho_Chi_Minh',
            })}
          </p>
        </>
      )}
    </div>
  );
}
