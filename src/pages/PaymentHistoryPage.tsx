import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { checkoutApi } from '../api/checkout';
import AppHeader from '../components/AppHeader';
import { checkoutMessage, checkoutPurposeLabel } from '../lib/checkout';
import { useAuthStore } from '../stores/useAuthStore';
export default function PaymentHistoryPage() {
  const [page, setPage] = useState(0);
  const user = useAuthStore((s) => s.user);
  const history = useQuery({
    queryKey: ['checkout-history', user?.userId, page],
    queryFn: () => checkoutApi.history(page),
    enabled: Boolean(user),
    refetchOnWindowFocus: true,
  });
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-2xl font-bold">Lịch sử thanh toán</h1>
        {history.isPending && <p className="mt-5">Đang tải…</p>}
        {history.isError && (
          <p role="alert" className="mt-5 text-red-700">
            Không tải được giao dịch. Vui lòng thử lại.
          </p>
        )}
        <div className="mt-6 space-y-3">
          {history.data?.map((o) => (
            <Link
              key={o.orderId}
              to={`/payment/return?orderId=${o.orderId}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5"
            >
              <p className="text-sm text-slate-600">
                {checkoutPurposeLabel(o.purpose)}
                {o.createdAt
                  ? ` · ${new Date(o.paidAt || o.createdAt).toLocaleString('vi-VN')}`
                  : ''}
              </p>
              <p className="font-semibold">
                {new Intl.NumberFormat('vi-VN').format(o.amount)} đ · {checkoutMessage(o)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {o.transferContent} · {o.environment === 'SANDBOX' ? 'Thử nghiệm' : 'Thực tế'}
              </p>
            </Link>
          ))}
          {history.data?.length === 0 && <p>Bạn chưa có giao dịch thanh toán mới.</p>}
        </div>
        <div className="mt-6 flex gap-5">
          <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Trang trước
          </button>
          <button
            type="button"
            disabled={history.data?.length !== 20}
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
          </button>
        </div>
      </main>
    </div>
  );
}
