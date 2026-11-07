import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { checkoutApi } from '../api/checkout';
import AppHeader from '../components/AppHeader';
import LoadingScreen from '../components/LoadingScreen';
import {
  beginCheckout,
  checkoutId,
  checkoutMessage,
  safePaymentDestination,
} from '../lib/checkout';
import { useAuthStore } from '../stores/useAuthStore';

export default function PaymentReturnPage() {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const pollDeadline = useRef(Date.now() + 120000);
  let context: { orderId?: string; returnTo?: string; user?: string } = {};
  try {
    const stored = JSON.parse(sessionStorage.getItem('sam:checkout') || '{}');
    if (stored && typeof stored === 'object') context = stored;
  } catch {
    /* Ignore invalid navigation metadata. */
  }
  const id =
    checkoutId(params.get('orderId')) ||
    (context.user === user?.userId ? checkoutId(context.orderId) : null);
  const result = useQuery({
    queryKey: ['checkout', user?.userId, id],
    queryFn: () => checkoutApi.get(id!),
    enabled: Boolean(isAuthenticated && id),
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      Date.now() < pollDeadline.current &&
      query.state.data &&
      (['PENDING', 'CREATING', 'UNKNOWN'].includes(query.state.data.paymentStatus) ||
        (query.state.data.paymentStatus === 'PAID' &&
          ['PENDING', 'RETRY'].includes(query.state.data.fulfillmentStatus)))
        ? 3000
        : false,
  });
  const order = result.data;
  useEffect(() => {
    if (order?.paymentStatus !== 'PAID' || order.fulfillmentStatus !== 'APPLIED') return;
    void cache.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'checkout' });
  }, [order?.paymentStatus, order?.fulfillmentStatus, cache]);
  if (isLoading) return <LoadingScreen />;
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-xl px-5 py-16">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            {order ? checkoutMessage(order) : 'Kiểm tra thanh toán'}
          </h1>
          {!isAuthenticated ? (
            <>
              <p className="mt-4 text-slate-600">
                Nếu thanh toán từ ứng dụng SAM, hãy mở lại ứng dụng để xem kết quả. Nếu dùng
                website, đăng nhập để kiểm tra đơn của bạn.
              </p>
              <Link
                className="mt-5 inline-block text-blue-700"
                to="/login"
                state={{ returnTo: `/payment/return${id ? `?orderId=${id}` : ''}` }}
              >
                Đăng nhập SAM
              </Link>
              {id && (
                <a className="ml-5 text-blue-700" href={`sam://payment-return?orderId=${id}`}>
                  Mở ứng dụng SAM
                </a>
              )}
            </>
          ) : (
            <>
              <p className="mt-4 text-slate-600">
                {order
                  ? `${new Intl.NumberFormat('vi-VN').format(order.amount)} đ · ${order.environment === 'SANDBOX' ? 'Giao dịch thử nghiệm' : 'Giao dịch thực tế'}`
                  : 'Kết quả được xác nhận trực tiếp từ Pay2S. Bạn không cần thanh toán lại khi đang chờ xác nhận.'}
              </p>
              {order && (
                <p className="mt-3 text-sm text-slate-500">
                  Mã hỗ trợ: {order.supportCode || order.orderId}
                  {order.paymentStatus === 'PENDING' && (
                    <>
                      <br />
                      Nội dung chuyển khoản: {order.transferContent}
                    </>
                  )}
                </p>
              )}
              {order?.reviewRequired && (
                <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                  SAM đang kiểm tra đơn này. Nếu đã chuyển tiền, bạn không cần thanh toán lại. Khi
                  liên hệ hỗ trợ, cung cấp mã đơn phía trên.
                </p>
              )}
              {order?.paymentStatus === 'PENDING' && order.checkoutUrl && (
                <button
                  type="button"
                  className="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-white"
                  onClick={() => beginCheckout(order, safePaymentDestination(context.returnTo))}
                >
                  Tiếp tục thanh toán
                </button>
              )}
              {result.isError && (
                <p role="alert" className="mt-4 text-red-700">
                  Chưa tải được giao dịch hoặc tài khoản hiện tại không sở hữu đơn này.
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  type="button"
                  className="rounded-xl bg-blue-700 px-5 py-3 text-white"
                  onClick={() =>
                    navigate(
                      safePaymentDestination(
                        context.user === user?.userId
                          ? context.returnTo
                          : order?.purpose === 'SUBSCRIPTION'
                            ? user?.role === 'CLIENT'
                              ? '/client/pricing'
                              : '/freelancer/pricing'
                            : null
                      ),
                      { replace: true }
                    )
                  }
                >
                  Quay lại dịch vụ
                </button>
                <Link to="/payments/history" className="py-3 text-blue-700">
                  Lịch sử thanh toán
                </Link>
                {id && (
                  <button
                    type="button"
                    className="text-blue-700"
                    onClick={() => void result.refetch()}
                  >
                    Kiểm tra lại
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
