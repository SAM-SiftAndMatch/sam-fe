import { useQuery } from '@tanstack/react-query';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { money } from '../api/finance';
import {
  AdminCard,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminPagination,
  adminInput,
  defaultPeriod,
  queryPage,
} from '../components/admin/AdminUI';
import { RevenueSources, RevenueTrend } from '../components/admin/RevenueCharts';
import RevenueTable from '../components/admin/RevenueTable';
import { useAuthStore } from '../stores/useAuthStore';

export default function AdminRevenuePage() {
  const user = useAuthStore((state) => state.user);
  const [params, setParams] = useSearchParams();
  const defaults = defaultPeriod();
  const page = queryPage(params);
  const request = new URLSearchParams(params);
  request.set('from', params.get('from') || defaults.from);
  request.set('to', params.get('to') || defaults.to);
  request.set('page', String(page));
  const report = useQuery({
    queryKey: ['admin-revenue', user?.userId, request.toString()],
    queryFn: () => adminApi.revenue(request),
  });
  const apply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    for (const key of ['from', 'to', 'source', 'q']) {
      const value = String(form.get(key) || '').trim();
      if (value) next.set(key, value);
    }
    if (params.get('projectId')) next.set('projectId', params.get('projectId')!);
    setParams(next);
  };
  const changePage = (next: number) => {
    const updated = new URLSearchParams(params);
    updated.set('page', String(next));
    setParams(updated);
  };
  return (
    <div>
      <AdminPageHeader
        title="Doanh thu nền tảng"
        description="Theo dõi doanh thu đã ghi nhận từ gói dịch vụ, phí dự án và tiện ích. Số liệu LIVE, theo múi giờ Việt Nam."
      />
      {params.get('projectId') && (
        <p className="mb-4 text-xs text-blue-600">
          Đang lọc doanh thu của một dự án.{' '}
          <Link to="/admin/revenue" className="font-semibold underline">
            Xem tất cả dự án
          </Link>
        </p>
      )}
      <form
        key={params.toString()}
        onSubmit={apply}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4"
      >
        <label className="space-y-1.5 text-xs text-slate-500">
          Từ ngày
          <input
            name="from"
            type="date"
            required
            defaultValue={request.get('from')!}
            className={`${adminInput} block`}
          />
        </label>
        <label className="space-y-1.5 text-xs text-slate-500">
          Đến ngày
          <input
            name="to"
            type="date"
            required
            defaultValue={request.get('to')!}
            className={`${adminInput} block`}
          />
        </label>
        <label className="space-y-1.5 text-xs text-slate-500">
          Nguồn thu
          <select
            name="source"
            defaultValue={params.get('source') || ''}
            className={`${adminInput} block min-w-40`}
          >
            <option value="">Tất cả nguồn thu</option>
            <option value="PACKAGE">Gói dịch vụ</option>
            <option value="PROJECT">Phí dự án & bảo trì</option>
            <option value="ADDON">Tiện ích dự án</option>
            <option value="OTHER">Khoản khác</option>
          </select>
        </label>
        <label className="min-w-40 flex-1 space-y-1.5 text-xs text-slate-500">
          Tìm khoản thu
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              name="q"
              maxLength={100}
              defaultValue={params.get('q') || ''}
              placeholder="Tên dự án, gói hoặc khách hàng…"
              className={`${adminInput} w-full pl-9`}
            />
          </div>
        </label>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Filter size={15} />
          Áp dụng
        </button>
        <Link
          to="/admin/revenue"
          aria-label="Xóa bộ lọc"
          title="Xóa bộ lọc"
          className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-3 text-slate-500 hover:bg-slate-50"
        >
          <RotateCcw size={15} />
        </Link>
      </form>
      {report.isPending ? (
        <AdminLoading />
      ) : report.isError ? (
        <AdminError error={report.error} retry={() => void report.refetch()} />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Tổng doanh thu', money(report.data.totals.total), 'Trong khoảng thời gian đã chọn'],
              ['Doanh thu gói', money(report.data.totals.packages), 'Gói dịch vụ đã kích hoạt'],
              [
                'Doanh thu dự án',
                money(report.data.totals.projects),
                'Phí dịch vụ & phí bảo trì đã ghi sổ',
              ],
              [
                'Lượt ghi nhận',
                report.data.totals.count.toLocaleString('vi-VN'),
                'Bút toán doanh thu sau đối soát',
              ],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950">
                  {value}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
          <div className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(280px,1fr)]">
            <AdminCard title="Doanh thu theo ngày">
              <RevenueTrend series={report.data.series} />
            </AdminCard>
            <AdminCard title="Phân bổ theo nguồn">
              <RevenueSources totals={report.data.totals} />
            </AdminCard>
          </div>
          <AdminCard
            title="Chi tiết các khoản thu"
            action={
              <span className="text-xs text-slate-400">
                {report.data.totals.count.toLocaleString('vi-VN')} lượt ghi nhận
              </span>
            }
          >
            <RevenueTable items={report.data.items} />
            <AdminPagination
              page={page}
              size={report.data.size}
              total={report.data.totals.count}
              onPage={changePage}
            />
          </AdminCard>
        </>
      )}
    </div>
  );
}
