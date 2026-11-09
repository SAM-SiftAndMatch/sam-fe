import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronLeft, ChevronRight, ReceiptText, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkoutApi } from '../api/checkout';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import { usePageSearchParam } from '../hooks/usePageSearchParam';
import { type Checkout, checkoutMessage, checkoutPurposeLabel } from '../lib/checkout';
import { useAuthStore } from '../stores/useAuthStore';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
function statusClass(order: Checkout) {
  if (
    order.reviewRequired ||
    order.paymentStatus === 'REVIEW' ||
    order.fulfillmentStatus === 'REVIEW'
  )
    return 'border-amber-200 bg-amber-50 text-amber-800';
  if (order.paymentStatus === 'PAID') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (order.paymentStatus === 'CANCELLED' || order.paymentStatus === 'EXPIRED')
    return 'border-slate-200 bg-slate-100 text-slate-600';
  return 'border-blue-200 bg-blue-50 text-blue-700';
}
function dateLabel(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
}

export default function PaymentHistoryPage() {
  const [page, setPage] = usePageSearchParam();
  const user = useAuthStore((s) => s.user);
  const history = useQuery({
    queryKey: ['checkout-history', user?.userId, page],
    queryFn: () => checkoutApi.history(page),
    enabled: Boolean(user),
    refetchOnWindowFocus: true,
  });
  const buttonClass =
    'inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:border-blue-300 hover:text-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <div
      className={`${user?.role === 'FREELANCER' ? 'freelancer-route' : 'client-route'} flex min-h-screen flex-col bg-[#F8FAFC] font-sans`}
    >
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-10">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Lịch sử thanh toán</h1>
            <p className="text-gray-500">
              Theo dõi các giao dịch và trạng thái thanh toán của bạn trên SAM.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void history.refetch()}
            disabled={history.isFetching}
            className={`${buttonClass} shrink-0 self-start`}
          >
            <RefreshCw size={16} className={history.isFetching ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>
        {history.isPending ? (
          <section
            aria-live="polite"
            aria-busy="true"
            className="space-y-4"
            aria-label="Đang tải lịch sử thanh toán"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="mb-4 h-4 w-1/3 rounded bg-slate-100" />
                <div className="h-6 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </section>
        ) : history.isError ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
          >
            <p>Không tải được giao dịch. Vui lòng thử lại.</p>
            <button
              type="button"
              onClick={() => void history.refetch()}
              className={`${buttonClass} mt-4`}
            >
              Thử lại
            </button>
          </div>
        ) : history.data?.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
              <ReceiptText size={36} className="text-slate-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              {page === 0 ? 'Chưa có giao dịch thanh toán' : 'Không có giao dịch ở trang này'}
            </h2>
            <p className="text-sm text-gray-500">
              {page === 0
                ? 'Các giao dịch của bạn sẽ xuất hiện tại đây khi được tạo.'
                : 'Quay lại trang trước để xem các giao dịch đã có.'}
            </p>
            {page === 0 && (
              <Link
                to="/workspaces"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-6 py-3 text-sm font-bold text-white hover:bg-blue-800"
              >
                Xem không gian làm việc <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {history.data?.map((order) => (
              <Link
                key={order.orderId}
                to={`/payment/return?orderId=${order.orderId}`}
                className="group block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-blue-600 md:p-6"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1D4ED8] sm:flex">
                      <ReceiptText size={22} />
                    </span>
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(order)}`}
                        >
                          {checkoutMessage(order)}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">
                          {dateLabel(order.paidAt || order.createdAt)}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-[#1D4ED8]">
                        {checkoutPurposeLabel(order.purpose)}
                      </h2>
                      <p className="mt-2 break-all text-sm text-gray-500">
                        Nội dung: {order.transferContent || '—'}
                      </p>
                      <p className="mt-1 break-all text-xs text-gray-400">
                        Mã giao dịch: {order.supportCode || order.orderId} ·{' '}
                        {order.environment === 'SANDBOX' ? 'Thử nghiệm' : 'Thực tế'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-6 border-t border-slate-100 pt-4 md:justify-end md:border-0 md:pt-0">
                    <span className="text-xl font-extrabold text-[#1D4ED8]">
                      {money.format(order.amount)}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-bold text-gray-600 group-hover:text-[#1D4ED8]">
                      Chi tiết <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!history.isPending &&
          !history.isError &&
          (page > 0 || (history.data?.length ?? 0) > 0) && (
            <nav
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
              aria-label="Phân trang lịch sử thanh toán"
            >
              <button
                type="button"
                disabled={page === 0 || history.isFetching}
                onClick={() => setPage(page - 1)}
                className={buttonClass}
              >
                <ChevronLeft size={16} /> Trước
              </button>
              <span
                aria-current="page"
                className="rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-bold text-white"
              >
                Trang {page + 1}
              </span>
              <button
                type="button"
                disabled={history.data?.length !== 20 || history.isFetching}
                onClick={() => setPage(page + 1)}
                className={buttonClass}
              >
                Sau <ChevronRight size={16} />
              </button>
            </nav>
          )}
      </main>
      <Footer />
    </div>
  );
}
