import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  FileCheck2,
  History,
  Info,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { checkoutApi } from '../api/checkout';
import AppHeader from '../components/AppHeader';
import LoadingScreen from '../components/LoadingScreen';
import { extractApiResponse } from '../lib/api-error';
import {
  beginCheckout,
  checkoutId,
  checkoutMessage,
  checkoutPurposeLabel,
  safePaymentDestination,
} from '../lib/checkout';
import { useAuthStore } from '../stores/useAuthStore';

const states = {
  CREATING: {
    icon: LoaderCircle,
    tone: 'blue',
    label: 'Đang khởi tạo',
    description:
      'SAM đang chuẩn bị liên kết thanh toán. Trang sẽ tự cập nhật khi liên kết sẵn sàng.',
  },
  PENDING: {
    icon: Clock3,
    tone: 'blue',
    label: 'Chờ thanh toán',
    description:
      'Tiếp tục đến Pay2S để thanh toán. Kết quả sẽ tự cập nhật sau khi ngân hàng xác nhận.',
  },
  UNKNOWN: {
    icon: ShieldAlert,
    tone: 'amber',
    label: 'Đang xác minh',
    description:
      'SAM đang xác minh kết quả với Pay2S. Nếu đã chuyển tiền, bạn không cần thanh toán lại.',
  },
  PAID: {
    icon: CheckCircle2,
    tone: 'green',
    label: 'Đã nhận thanh toán',
    description:
      'SAM đã nhận xác nhận thanh toán và đang hoàn tất ghi nhận. Bạn không cần thanh toán thêm.',
  },
  CANCELLED: {
    icon: XCircle,
    tone: 'slate',
    label: 'Đã hủy',
    description: 'Liên kết thanh toán cũ đã đóng. Bạn có thể yêu cầu tạo liên kết mới để tiếp tục.',
  },
  EXPIRED: {
    icon: Clock3,
    tone: 'amber',
    label: 'Liên kết hết hạn',
    description:
      'Nếu chưa chuyển tiền, hãy tạo lại liên kết. SAM sẽ kiểm tra và đóng liên kết cũ trước khi tạo mới.',
  },
  REVIEW: {
    icon: ShieldAlert,
    tone: 'amber',
    label: 'Cần đối soát',
    description:
      'Giao dịch cần được đối chiếu thêm. Nếu đã chuyển tiền, hãy giữ chứng từ và cung cấp mã hỗ trợ bên dưới.',
  },
} as const;
const tones: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 ring-blue-100',
  green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  slate: 'bg-slate-100 text-slate-500 ring-slate-200',
};
const primary =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50';
const secondary =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50';
function date(value?: string) {
  if (!value || Number.isNaN(Date.parse(value))) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

export default function PaymentReturnPage() {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const pollDeadline = useRef(Date.now() + 120000);
  const [copied, setCopied] = useState('');
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
  const destination = safePaymentDestination(
    context.user === user?.userId
      ? context.returnTo
      : user?.role === 'CLIENT'
        ? '/client/pricing'
        : user?.role === 'FREELANCER'
          ? '/freelancer/pricing'
          : null
  );
  useEffect(() => {
    pollDeadline.current = Date.now() + 120000;
  }, [id]);
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
  const retry = useMutation({
    mutationFn: (input: { orderId: string; ownerId: string }) => checkoutApi.retry(input.orderId),
    onSuccess: (updated, input) => {
      cache.setQueryData(['checkout', input.ownerId, updated.orderId], updated);
      void cache.invalidateQueries({ queryKey: ['checkout-history', input.ownerId] });
      if (useAuthStore.getState().user?.userId !== input.ownerId) return;
      if (updated.orderId !== input.orderId) {
        sessionStorage.setItem(
          'sam:checkout',
          JSON.stringify({ orderId: updated.orderId, returnTo: destination, user: input.ownerId })
        );
        pollDeadline.current = Date.now() + 120000;
        navigate(`/payment/return?orderId=${updated.orderId}`, { replace: true });
      }
    },
  });
  const retryForOrder = retry.variables?.orderId === id && retry.variables.ownerId === user?.userId;
  const retrying = retryForOrder && retry.isPending;
  useEffect(() => {
    if (order?.paymentStatus === 'PAID' && order.fulfillmentStatus === 'APPLIED')
      void cache.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'checkout' });
  }, [order?.paymentStatus, order?.fulfillmentStatus, cache]);
  if (isLoading) return <LoadingScreen />;
  const status = order ? states[order.paymentStatus] : states.CREATING;
  const complete = order?.paymentStatus === 'PAID' && order.fulfillmentStatus === 'APPLIED';
  const fulfilmentReview = order?.paymentStatus === 'PAID' && order.fulfillmentStatus === 'REVIEW';
  const Icon = fulfilmentReview ? ShieldAlert : status.icon;
  const tone = fulfilmentReview ? 'amber' : status.tone;
  const support = order?.supportCode || order?.orderId || id || '';
  const refresh = () => {
    pollDeadline.current = Date.now() + 120000;
    void result.refetch();
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(support);
      setCopied(support);
    } catch {
      setCopied('');
    }
  };
  const step = complete
    ? 3
    : order?.paymentStatus === 'PAID'
      ? 2
      : order?.paymentStatus === 'CREATING'
        ? 0
        : 1;
  return (
    <div className="payment-return-page min-h-dvh bg-[#f6f8fc]">
      <AppHeader />
      <main className="mx-auto w-full max-w-[1060px] px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to={destination}
          className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={15} />
          Quay lại dịch vụ
        </Link>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold tracking-[.18em] text-blue-600">
              SAM PAYMENTS
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Thông tin thanh toán
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Theo dõi giao dịch và tiếp tục công việc của bạn.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-500">
            <LockKeyhole size={13} />
            Kết nối thanh toán bảo mật
          </span>
        </div>
        {!isAuthenticated ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-10">
            <div className="mb-5 inline-flex rounded-2xl bg-blue-50 p-4 text-blue-600">
              <ShieldCheck size={30} />
            </div>
            <h2 className="text-xl font-bold">Đăng nhập để xem giao dịch của bạn</h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
              Nếu thanh toán từ ứng dụng SAM, bạn có thể mở lại ứng dụng để xem kết quả. Đăng nhập
              website để theo dõi giao dịch trên trình duyệt này.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className={primary}
                to="/login"
                state={{ returnTo: `/payment/return${id ? `?orderId=${id}` : ''}` }}
              >
                Đăng nhập SAM
                <ArrowRight size={16} />
              </Link>
              {id && (
                <a className={secondary} href={`sam://payment-return?orderId=${id}`}>
                  <Smartphone size={16} />
                  Mở ứng dụng SAM
                </a>
              )}
            </div>
          </section>
        ) : result.isError ? (
          <section role="alert" className="rounded-2xl border border-red-100 bg-white p-8">
            <ShieldAlert className="mb-4 text-red-500" size={32} />
            <h2 className="text-lg font-bold">Chưa tải được giao dịch</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Kiểm tra kết nối và bảo đảm bạn đang đăng nhập đúng tài khoản đã thanh toán.
            </p>
            <button type="button" className={`${secondary} mt-5`} onClick={refresh}>
              <RefreshCw size={15} />
              Thử lại
            </button>
          </section>
        ) : !id ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-lg font-bold">Chưa có mã giao dịch</h2>
            <p className="mt-3 text-sm text-slate-500">
              Mở giao dịch từ lịch sử thanh toán để tiếp tục.
            </p>
            <Link className={`${primary} mt-5`} to="/payments/history">
              <History size={16} />
              Lịch sử thanh toán
            </Link>
          </section>
        ) : !order ? (
          <div
            aria-label="Đang tải giao dịch"
            className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ) : (
          <>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
              <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_30px_-16px_rgba(15,23,42,.16)]">
                <div className="p-6 sm:p-8">
                  <div className={`mb-6 inline-flex rounded-2xl p-4 ring-1 ${tones[tone]}`}>
                    <Icon
                      size={34}
                      strokeWidth={1.6}
                      className={
                        order.paymentStatus === 'CREATING' ? 'motion-safe:animate-spin' : ''
                      }
                    />
                  </div>
                  <p
                    className={`mb-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}
                  >
                    {status.label}
                  </p>
                  <h2 className="text-xl font-bold leading-8 tracking-tight text-slate-950 sm:text-2xl">
                    {checkoutMessage(order)}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {complete
                      ? 'Thanh toán đã được ghi nhận trên SAM. Bạn có thể quay lại dịch vụ để tiếp tục.'
                      : fulfilmentReview
                        ? 'Đã nhận tiền, nhưng việc hoàn tất cần kiểm tra thêm. Bạn không cần chuyển tiền lần nữa.'
                        : status.description}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:items-start">
                    {complete ? (
                      <button
                        type="button"
                        className={primary}
                        onClick={() => navigate(destination, { replace: true })}
                      >
                        Quay lại dịch vụ
                        <ArrowRight size={16} />
                      </button>
                    ) : order.paymentStatus === 'PENDING' && order.checkoutUrl ? (
                      <button
                        type="button"
                        className={`${primary} w-full sm:w-auto`}
                        onClick={() => beginCheckout(order, destination)}
                      >
                        <CreditCard size={17} />
                        Tiếp tục thanh toán
                        <ArrowRight size={16} />
                      </button>
                    ) : ['EXPIRED', 'CANCELLED'].includes(order.paymentStatus) ? (
                      <>
                        <p className="text-xs leading-6 text-slate-500">
                          Nếu đã chuyển tiền, hãy kiểm tra lại giao dịch hoặc liên hệ hỗ trợ trước
                          khi tạo liên kết mới.
                        </p>
                        <button
                          type="button"
                          disabled={retrying || !user?.userId}
                          className={`${primary} w-full sm:w-auto`}
                          onClick={() => {
                            if (user?.userId)
                              retry.mutate({ orderId: order.orderId, ownerId: user.userId });
                          }}
                        >
                          <RefreshCw
                            size={16}
                            className={retrying ? 'motion-safe:animate-spin' : ''}
                          />
                          {retrying ? 'Đang khôi phục thanh toán…' : 'Tạo lại liên kết thanh toán'}
                        </button>
                        <p className="text-[11px] leading-5 text-slate-400">
                          Đơn hủy được Pay2S xác nhận sẽ được tạo lại tự động. Giao dịch chưa rõ
                          tiền cần đội ngũ hỗ trợ đối soát.
                        </p>
                      </>
                    ) : null}
                    {retryForOrder && retry.isError && (
                      <p
                        role="alert"
                        className="w-full rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-6 text-amber-900"
                      >
                        {extractApiResponse(retry.error)?.message ||
                          'Chưa xác minh được liên kết cũ. Vui lòng kiểm tra lại hoặc cung cấp mã hỗ trợ để được xử lý.'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:px-8">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <ShieldCheck size={16} className="text-blue-500" />
                    Tiến trình giao dịch
                  </div>
                  <ol className="mt-4 space-y-4">
                    {[
                      'Khởi tạo thanh toán',
                      'Xác nhận từ ngân hàng',
                      'Hoàn tất ghi nhận trên SAM',
                    ].map((label, index) => (
                      <li key={label} className="flex items-center gap-3 text-xs">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${index < step ? 'bg-blue-600 text-white' : index === step ? 'bg-blue-100 text-blue-600' : 'bg-slate-200/70 text-slate-400'}`}
                        >
                          {index < step ? <Check size={13} /> : index + 1}
                        </span>
                        <span className={index <= step ? 'text-slate-600' : 'text-slate-400'}>
                          {label}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
              <div className="min-w-0 space-y-5">
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                  <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4 text-sm font-semibold">
                    <FileCheck2 size={17} className="text-slate-400" />
                    Chi tiết giao dịch
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-slate-400">Số tiền thanh toán</p>
                    <p className="mt-2 break-words text-3xl font-bold tracking-tight text-slate-950">
                      {new Intl.NumberFormat('vi-VN').format(order.amount)}
                      <span className="ml-1 text-lg font-medium text-slate-400">đ</span>
                    </p>
                    <span
                      className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${order.environment === 'LIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                    >
                      {order.environment === 'LIVE' ? 'Giao dịch thực tế' : 'Giao dịch thử nghiệm'}
                    </span>
                    <dl className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-xs">
                      <div className="flex items-start justify-between gap-5">
                        <dt className="shrink-0 text-slate-400">Nội dung</dt>
                        <dd className="text-right font-medium text-slate-700">
                          {checkoutPurposeLabel(order.purpose)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-400">Ngày tạo</dt>
                        <dd className="text-right text-slate-600">{date(order.createdAt)}</dd>
                      </div>
                      {order.paymentStatus === 'PENDING' && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-400">Hiệu lực đến</dt>
                          <dd className="text-right text-slate-600">{date(order.expiresAt)}</dd>
                        </div>
                      )}
                      {order.paidAt && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-400">Đã xác nhận</dt>
                          <dd className="text-right text-slate-600">{date(order.paidAt)}</dd>
                        </div>
                      )}
                      {order.paymentStatus === 'PENDING' && (
                        <div className="rounded-xl bg-blue-50 p-3">
                          <dt className="text-blue-500">Nội dung chuyển khoản</dt>
                          <dd className="mt-2 break-all font-mono text-sm font-semibold text-blue-800">
                            {order.transferContent}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-3">
                      <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Mã hỗ trợ</span>
                        <button
                          type="button"
                          onClick={() => void copy()}
                          aria-label="Sao chép mã hỗ trợ"
                          title="Sao chép mã hỗ trợ"
                          className="inline-flex items-center gap-1 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                        >
                          {copied === support ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copied === support ? 'Đã sao chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                      <p className="break-all font-mono text-xs font-medium leading-6 text-slate-700">
                        {support}
                      </p>
                    </div>
                  </div>
                </section>
                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <Info size={17} className="mt-0.5 shrink-0 text-blue-500" />
                  <p className="text-xs leading-6 text-blue-900/70">
                    Kết quả được cập nhật trực tiếp từ Pay2S. Bạn có thể rời trang và xem lại giao
                    dịch trong lịch sử thanh toán.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className={secondary}
                  onClick={refresh}
                  disabled={result.isFetching}
                >
                  <RefreshCw
                    size={15}
                    className={result.isFetching ? 'motion-safe:animate-spin' : ''}
                  />
                  Kiểm tra lại
                </button>
                <Link to="/payments/history" className={secondary}>
                  <History size={15} />
                  Lịch sử thanh toán
                </Link>
              </div>
              {!complete && (
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-2 px-1 text-xs font-medium text-slate-500 hover:text-blue-600"
                  onClick={() => navigate(destination, { replace: true })}
                >
                  Quay lại dịch vụ
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
