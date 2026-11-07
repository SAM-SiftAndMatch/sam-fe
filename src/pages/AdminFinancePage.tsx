import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  type BankAccount,
  type Beneficiary,
  type MaintenanceTicket,
  type Withdrawal,
  dateTime,
  financeError,
  financeGet,
  financePost,
  money,
  statusLabel,
} from '../api/finance';
import AppHeader from '../components/AppHeader';
import {
  Field,
  Modal,
  Notice,
  inputClass,
  primaryClass,
  secondaryClass,
} from '../components/finance/FinanceUI';
import MaintenancePanel from '../components/finance/MaintenancePanel';
import PaymentCasesPanel from '../components/finance/PaymentCasesPanel';
import { useAuthStore } from '../stores/useAuthStore';

interface FinanceReceipt {
  id: string;
  provider: string;
  environment: string;
  providerReference: string;
  amount: number;
  disposition: string;
  createdAt: string;
}
interface FinanceAudit {
  id: string;
  actorId?: string;
  subjectId?: string;
  action: string;
  detail: string;
  createdAt: string;
}
export default function AdminFinancePage() {
  const user = useAuthStore((s) => s.user);
  const cache = useQueryClient();
  const [tab, setTab] = useState('tickets');
  const [page, setPage] = useState(0);
  const [operation, setOperation] = useState<{ id: string; type: string } | null>(null);
  const [password, setPassword] = useState('');
  const [note, setNote] = useState('');
  const [reference, setReference] = useState('');
  const [evidence, setEvidence] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [job, setJob] = useState<string | null>(null);
  useEffect(() => {
    if (!beneficiary) return;
    const timer = setTimeout(() => setBeneficiary(null), 60000);
    const hide = () => {
      if (document.hidden) setBeneficiary(null);
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [beneficiary]);
  const banks = useQuery({
    queryKey: ['admin-finance', user?.userId, 'banks', page],
    queryFn: () => financeGet<BankAccount[]>(`/finance/admin/bank-accounts?page=${page}`),
    enabled: user?.role === 'ADMIN' && tab === 'banks',
  });
  const withdrawals = useQuery({
    queryKey: ['admin-finance', user?.userId, 'withdrawals', page],
    queryFn: () => financeGet<Withdrawal[]>(`/finance/admin/withdrawals?page=${page}`),
    enabled: user?.role === 'ADMIN' && tab === 'withdrawals',
    refetchInterval: 30000,
  });
  const tickets = useQuery({
    queryKey: ['admin-finance', user?.userId, 'tickets', page],
    queryFn: () => financeGet<MaintenanceTicket[]>(`/finance/admin/tickets?page=${page}`),
    enabled: user?.role === 'ADMIN' && tab === 'tickets',
    refetchInterval: 30000,
  });
  const receipts = useQuery({
    queryKey: ['admin-finance', user?.userId, 'receipts', page],
    queryFn: () => financeGet<FinanceReceipt[]>(`/finance/admin/receipts?page=${page}`),
    enabled: user?.role === 'ADMIN' && tab === 'receipts',
    refetchInterval: 30000,
  });
  const checkoutReviews = useQuery({
    queryKey: ['admin-finance', user?.userId, 'checkout-review', page],
    queryFn: () =>
      financeGet<
        {
          id: string;
          purpose: string;
          amount: number;
          environment: string;
          status: string;
          fulfillmentStatus: string;
          recommendationStatus?: string;
          providerReference?: string;
          receivedAmount?: number;
        }[]
      >(`/checkouts/admin/review?page=${page}`),
    enabled: user?.role === 'ADMIN' && tab === 'checkout-review',
    refetchInterval: 15000,
  });
  const audit = useQuery({
    queryKey: ['admin-finance', user?.userId, 'audit', page],
    queryFn: () => financeGet<FinanceAudit[]>(`/finance/admin/audit?page=${page}`),
    enabled: user?.role === 'ADMIN' && tab === 'audit',
  });
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  const open = (id: string, type: string) => {
    setOperation({ id, type });
    setPassword('');
    setNote('');
    setReference('');
    setEvidence('');
    setError('');
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!operation) return;
    setBusy(true);
    setError('');
    const { id, type } = operation;
    try {
      if (type === 'reveal-bank')
        setBeneficiary(
          await financePost<Beneficiary>(`/finance/admin/bank-accounts/${id}/reveal`, { password })
        );
      else if (type === 'verify' || type === 'reject-bank')
        await financePost(`/finance/admin/bank-accounts/${id}/verify`, {
          password,
          note,
          approved: type === 'verify',
        });
      else if (type === 'start-manual-payment')
        setBeneficiary(
          await financePost<Beneficiary>(`/finance/admin/withdrawals/${id}/${type}`, { password })
        );
      else
        await financePost(`/finance/admin/withdrawals/${id}/${type}`, {
          password,
          note,
          bankReference: reference,
          evidenceReference: evidence,
        });
      setOperation(null);
      setNotice('Đã ghi nhận thao tác và nhật ký.');
      await cache.invalidateQueries({ queryKey: ['admin-finance', user.userId] });
    } catch (cause) {
      setError(financeError(cause));
    } finally {
      setBusy(false);
      setPassword('');
    }
  };
  const list =
    tab === 'checkout-review'
      ? checkoutReviews
      : tab === 'banks'
        ? banks
        : tab === 'withdrawals'
          ? withdrawals
          : tab === 'receipts'
            ? receipts
            : tab === 'audit'
              ? audit
              : tickets;
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-700">VẬN HÀNH SAM</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Tài chính & bảo trì</h1>
          <p className="mt-2 text-sm text-slate-500">
            Xác minh người nhận, kiểm soát chi trả và xử lý ticket sau nghiệm thu.
          </p>
        </div>
        <Notice>
          Chi trả hiện dùng chuyển khoản thủ công có đối soát. Xem người nhận chỉ sau xác thực lại.
          Nếu bật kiểm soát kép, người chuyển tiền phải khác người duyệt.
        </Notice>
        {notice && <Notice>{notice}</Notice>}
        <div className="flex flex-wrap gap-2">
          {[
            ['banks', 'Xác minh ngân hàng'],
            ['withdrawals', 'Chi trả công nợ'],
            ['tickets', 'Ticket bảo trì'],
            ['receipts', 'Đối soát tiền vào'],
            ['checkout-review', 'Đối soát gói và checkout'],
            ['payment-cases', 'Hồ sơ sự cố thanh toán'],
            ['audit', 'Nhật ký vận hành'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={tab === key ? primaryClass : secondaryClass}
              onClick={() => {
                setTab(key);
                setPage(0);
                setJob(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {tab !== 'payment-cases' && list.isError && (
          <Notice error>
            Không tải được dữ liệu.{' '}
            <button type="button" onClick={() => void list.refetch()} className="underline">
              Thử lại
            </button>
          </Notice>
        )}
        {tab !== 'payment-cases' && list.isPending && <p className="text-slate-500">Đang tải…</p>}
        {tab !== 'payment-cases' && list.data?.length === 0 && (
          <Notice>Chưa có mục nào trong danh sách.</Notice>
        )}
        {tab === 'payment-cases' && <PaymentCasesPanel owner={user.userId} />}
        {tab === 'banks' &&
          banks.data?.map((bank) => (
            <div
              key={bank.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5"
            >
              <div>
                <p className="font-semibold">
                  {bank.bankCode} · •••• {bank.lastFour}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {statusLabel[bank.status]} · {dateTime(bank.createdAt)}
                </p>
                <p className="mt-1 break-all text-xs text-slate-400">
                  Chủ sở hữu: {bank.ownerName || bank.ownerId}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={secondaryClass}
                  onClick={() => open(bank.id, 'reveal-bank')}
                >
                  Xem để xác minh
                </button>
                {bank.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      className={primaryClass}
                      onClick={() => open(bank.id, 'verify')}
                    >
                      Xác minh
                    </button>
                    <button
                      type="button"
                      className={secondaryClass}
                      onClick={() => open(bank.id, 'reject-bank')}
                    >
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        {tab === 'withdrawals' &&
          withdrawals.data?.map((w) => (
            <div key={w.id} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-lg font-bold">{money(w.amount)}</p>
                  <p className="text-sm text-slate-500">
                    {w.bankCode} · •••• {w.lastFour} · {statusLabel[w.status]}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-400">
                    {w.id} · {dateTime(w.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  {w.status === 'REQUESTED' && (
                    <button
                      type="button"
                      className={primaryClass}
                      onClick={() => open(w.id, 'approve')}
                    >
                      Duyệt chi
                    </button>
                  )}
                  {['REQUESTED', 'APPROVED'].includes(w.status) && (
                    <button
                      type="button"
                      className={secondaryClass}
                      onClick={() => open(w.id, 'reject')}
                    >
                      Từ chối
                    </button>
                  )}
                  {['APPROVED', 'PROCESSING'].includes(w.status) && (
                    <button
                      type="button"
                      className={primaryClass}
                      onClick={() => open(w.id, 'start-manual-payment')}
                    >
                      Nhận chuyển khoản / xem người nhận
                    </button>
                  )}
                  {['PROCESSING', 'RECONCILIATION_REQUIRED'].includes(w.status) && (
                    <>
                      <button
                        type="button"
                        className={primaryClass}
                        onClick={() => open(w.id, 'confirm-manual-payment')}
                      >
                        Xác nhận đã chi
                      </button>
                      <button
                        type="button"
                        className={secondaryClass}
                        onClick={() => open(w.id, 'reconcile')}
                      >
                        Cần đối soát
                      </button>
                    </>
                  )}
                  {w.status === 'RECONCILIATION_REQUIRED' && (
                    <button
                      type="button"
                      className={secondaryClass}
                      onClick={() => open(w.id, 'confirm-failed')}
                    >
                      Xác nhận không chuyển tiền
                    </button>
                  )}
                </div>
              </div>
              {w.bankReference && (
                <p className="text-xs text-slate-500">Mã giao dịch: {w.bankReference}</p>
              )}
            </div>
          ))}
        {tab === 'tickets' &&
          tickets.data?.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              className="block w-full rounded-2xl border border-slate-100 bg-white p-5 text-left hover:border-blue-200"
              onClick={() => setJob(ticket.scopeId || ticket.jobId || null)}
            >
              <p className="font-semibold">{ticket.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {ticket.jobTitle} · {statusLabel[ticket.status]} · Hạn{' '}
                {dateTime(ticket.resolutionDueAt)}
              </p>
            </button>
          ))}
        {tab === 'checkout-review' && (
          <>
            <Notice>
              Đối soát các giao dịch có kết quả tạo đơn chưa rõ, tiền không khớp hoặc kích hoạt đang
              thử lại. Không yêu cầu khách trả thêm khi đã ghi nhận tiền.
            </Notice>
            {checkoutReviews.data?.map((o, index) => (
              <article
                key={`${o.id}:${index}`}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <p className="font-semibold">
                  {money(o.amount)} · {o.purpose} · {o.environment}
                </p>
                <p>
                  {o.status} · {o.fulfillmentStatus}
                  {o.recommendationStatus === 'RETRY' ? ' · Gợi ý freelancer đang thử lại' : ''}
                </p>
                <p className="break-all text-sm">
                  Mã checkout: {o.id} · Mã giao dịch: {o.providerReference || 'Chưa có'}
                </p>
                {o.receivedAmount != null && <p>Đã nhận: {money(o.receivedAmount)}</p>}
              </article>
            ))}
          </>
        )}
        {tab === 'receipts' && (
          <Notice>
            Khoản cần rà soát được giữ riêng trong sổ cái, chưa tạo công nợ có thể rút. Đối chiếu
            tài khoản ngân hàng và mã giao dịch trước khi xử lý hoàn tiền theo quy trình vận hành.
          </Notice>
        )}
        {tab === 'receipts' &&
          receipts.data?.map((receipt) => (
            <article
              key={receipt.id}
              className="space-y-2 rounded-2xl border border-slate-100 bg-white p-5"
            >
              <p className="font-semibold">
                {money(receipt.amount)} · {receipt.provider} · {receipt.environment}
              </p>
              <p
                className={
                  receipt.disposition === 'REVIEW'
                    ? 'text-sm font-semibold text-amber-700'
                    : 'text-sm text-emerald-700'
                }
              >
                {receipt.disposition === 'APPLIED' ? 'Đã hạch toán' : 'Cần rà soát nguồn tiền'}
              </p>
              <p className="break-all text-xs text-slate-500">
                Mã nhà cung cấp: {receipt.providerReference} · {dateTime(receipt.createdAt)}
              </p>
            </article>
          ))}
        {tab === 'audit' &&
          audit.data?.map((entry) => (
            <article
              key={entry.id}
              className="space-y-2 rounded-2xl border border-slate-100 bg-white p-5"
            >
              <p className="font-semibold">{entry.action}</p>
              <p className="whitespace-pre-wrap text-sm text-slate-600">{entry.detail}</p>
              <p className="break-all text-xs text-slate-400">
                {dateTime(entry.createdAt)} · Người thực hiện: {entry.actorId || 'Hệ thống'} · Đối
                tượng: {entry.subjectId || '—'}
              </p>
            </article>
          ))}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={page === 0}
            className={secondaryClass}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </button>
          <span className="self-center text-sm">Trang {page + 1}</span>
          <button
            type="button"
            disabled={list.data?.length !== 25}
            className={secondaryClass}
            onClick={() => setPage((p) => p + 1)}
          >
            Tiếp
          </button>
        </div>
        {job && <MaintenancePanel jobId={job} completed viewerRole="admin" />}
        {operation && (
          <Modal
            title="Xác nhận thao tác tài chính"
            onClose={() => {
              setOperation(null);
              setPassword('');
            }}
            busy={busy}
          >
            <form onSubmit={(e) => void submit(e)} className="space-y-4">
              <p className="text-sm text-slate-500">Mã đối tượng: {operation.id}</p>
              <Field label="Mật khẩu quản trị hiện tại">
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {!['reveal-bank', 'start-manual-payment', 'approve'].includes(operation.type) && (
                <Field label="Lý do / căn cứ đối soát">
                  <textarea
                    required
                    maxLength={1000}
                    rows={3}
                    className={inputClass}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
              )}
              {operation.type === 'confirm-manual-payment' && (
                <>
                  <Field label="Mã giao dịch ngân hàng">
                    <input
                      required
                      maxLength={150}
                      className={inputClass}
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Tham chiếu chứng từ nội bộ"
                    hint="Dùng tham chiếu chứng từ có kiểm soát quyền truy cập, không dùng URL công khai chứa dữ liệu người nhận."
                  >
                    <input
                      required
                      maxLength={300}
                      className={inputClass}
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value)}
                    />
                  </Field>
                  <Notice>
                    Chỉ xác nhận khi đã đối chiếu số tiền, người nhận và kết quả ngân hàng. Nếu chưa
                    rõ kết quả, chuyển sang đối soát để tránh chi trùng.
                  </Notice>
                </>
              )}
              {error && <Notice error>{error}</Notice>}
              <button type="submit" disabled={busy} className={primaryClass}>
                {busy ? 'Đang xử lý…' : 'Xác nhận'}
              </button>
            </form>
          </Modal>
        )}
        {beneficiary && (
          <Modal title="Thông tin người nhận" onClose={() => setBeneficiary(null)}>
            <Notice>
              Chỉ dùng cho xác minh hoặc lệnh chi đang thực hiện. Đóng hộp thoại sau khi dùng; không
              sao chép vào chat hoặc log.
            </Notice>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-500">Ngân hàng</dt>
                <dd className="font-semibold">{beneficiary.bankCode}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Số tài khoản</dt>
                <dd className="break-all font-mono text-lg">{beneficiary.accountNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Tên thụ hưởng</dt>
                <dd className="font-semibold">{beneficiary.accountHolder}</dd>
              </div>
              {beneficiary.amount && (
                <div>
                  <dt className="text-xs text-slate-500">Số tiền</dt>
                  <dd className="font-bold">{money(beneficiary.amount)}</dd>
                </div>
              )}
            </dl>
          </Modal>
        )}
      </main>
    </div>
  );
}
