import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { extractApiResponse, getApiErrorMessage } from '../../lib/api-error';
export const adminInput =
  'h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-blue-600">
          {eyebrow || 'Vận hành nền tảng'}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function AdminCard({
  title,
  children,
  action,
  className = '',
}: { title?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white ${className}`}>
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function AdminError({ retry, error }: { retry: () => void; error?: unknown }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-800"
    >
      {getApiErrorMessage(
        extractApiResponse(error),
        'Chưa tải được dữ liệu. Vui lòng kiểm tra lại kết nối.'
      )}
      <button
        type="button"
        onClick={retry}
        className="ml-3 inline-flex items-center gap-1.5 font-semibold underline"
      >
        <RefreshCw size={14} />
        Thử lại
      </button>
    </div>
  );
}
export function AdminLoading() {
  return (
    <div aria-label="Đang tải dữ liệu" className="space-y-4 animate-pulse">
      <div className="h-24 rounded-2xl bg-slate-200/60" />
      <div className="h-64 rounded-2xl bg-slate-200/60" />
    </div>
  );
}
export function AdminPagination({
  page,
  size,
  total,
  onPage,
}: { page: number; size: number; total: number; onPage: (page: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
      <span>
        {total === 0 || page * size >= total
          ? '0 kết quả'
          : `${page * size + 1}–${Math.min((page + 1) * size, total)} trong ${total.toLocaleString('vi-VN')} kết quả`}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label="Trang trước"
          disabled={page <= 0}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft size={15} />
        </button>
        <span className="px-2 py-2">{page + 1}</span>
        <button
          type="button"
          aria-label="Trang sau"
          disabled={(page + 1) * size >= total}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
export function adminDate(value?: string) {
  if (!value || Number.isNaN(Date.parse(value))) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}
export function defaultPeriod() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).formatToParts(new Date());
  const part = (name: string) => parts.find((p) => p.type === name)?.value;
  const to = `${part('year')}-${part('month')}-${part('day')}`;
  const start = new Date(`${to}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 29);
  return { from: start.toISOString().slice(0, 10), to };
}
export function queryPage(params: URLSearchParams) {
  const page = Number(params.get('page') || '0');
  return Number.isInteger(page) && page >= 0 && page <= 100000 ? page : 0;
}
