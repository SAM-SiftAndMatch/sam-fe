import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  type BankAccount,
  type Beneficiary,
  type MaintenanceTicket,
  type Withdrawal,
  dateTime,
  financeApi,
  financeError,
  financeGet,
  financePost,
  money,
  statusLabel,
} from '../api/finance';
import { AdminPageHeader } from '../components/admin/AdminUI';
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
import PayoutReceiptUpload from '../components/finance/PayoutReceiptUpload';
import WithdrawalEvidence, { PayoutReceipts } from '../components/finance/WithdrawalEvidence';
import { evidenceError } from '../lib/early-withdrawal';
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
const operationSuccessMessages: Record<string, string> = {
  'reveal-bank': 'Đã mở thông tin tài khoản ngân hàng để xác minh.',
  verify: 'Đã xác minh tài khoản ngân hàng thành công.',
  'reject-bank': 'Đã từ chối xác minh tài khoản ngân hàng.',
  approve: 'Đã duyệt yêu cầu rút tiền. Lệnh chi đang chờ chuyển khoản.',
  reject: 'Đã từ chối yêu cầu rút tiền.',
  'start-manual-payment': 'Đã nhận xử lý chuyển khoản và mở thông tin người nhận.',
  'confirm-manual-payment': 'Đã ghi nhận xác nhận chi trả thành công.',
  reconcile: 'Đã chuyển lệnh chi sang chờ đối soát.',
  'confirm-failed': 'Đã ghi nhận lệnh chi không thành công.',
};
function AdminFinanceContent({ tab }: { tab: string }) {
  const user = useAuthStore((s) => s.user);
  const cache = useQueryClient();
  const [page, setPage] = useState(0);
  const [operation, setOperation] = useState<{ id: string; type: string } | null>(null);
  const [password, setPassword] = useState('');
  const [note, setNote] = useState('');
  const [reference, setReference] = useState('');
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [job, setJob] = useState<string | null>(null);
  const [requestType, setRequestType] = useState('');
  const [withdrawalDetail, setWithdrawalDetail] = useState<Withdrawal | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
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
    queryKey: ['admin-finance', user?.userId, 'withdrawals', page, requestType],
    queryFn: () =>
      financeGet<Withdrawal[]>(
        `/finance/admin/withdrawals?page=${page}${requestType ? `&type=${requestType}` : ''}`
      ),
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
  const loadWithdrawal = async (id: string) => {
    setDetailLoading(true);
    try {
      setWithdrawalDetail(await financeGet<Withdrawal>(`/finance/withdrawals/${id}`));
    } catch (cause) {
      toast.error(financeError(cause));
    } finally {
      setDetailLoading(false);
    }
  };
  const open = (id: string, type: string) => {
    setOperation({ id, type });
    setPassword('');
    setNote('');
    setReference('');
    setReceiptFiles([]);
    setError('');
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!operation || busy) return;
    if (operation.type === 'confirm-manual-payment') {
      const invalid = evidenceError(receiptFiles);
      if (invalid) {
        setError(invalid);
        return;
      }
    }
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
      else if (type === 'confirm-manual-payment')
        await financeApi.confirmManualPayment(
          id,
          { password, note, bankReference: reference },
          receiptFiles
        );
      else
        await financePost(`/finance/admin/withdrawals/${id}/${type}`, {
          password,
          note,
          bankReference: reference,
        });
      setOperation(null);
      setReceiptFiles([]);
      setWithdrawalDetail(null);
      toast.success(operationSuccessMessages[type] ?? 'Đã ghi nhận thao tác thành công.');
      await cache
        .invalidateQueries({ queryKey: ['admin-finance', user.userId] }, { throwOnError: true })
        .catch(() => {
          toast.warning(
            'Thao tác đã thành công nhưng chưa tải lại được danh sách. Vui lòng tải lại trang.'
          );
        });
    } catch (cause) {
      const message = financeError(cause);
      setError(message);
      toast.error(message);
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
    <div>
      <div className="space-y-6">
        <AdminPageHeader title={financeTitles[tab]} description={financeDescriptions[tab]} />
        {['banks', 'withdrawals'].includes(tab) && (
          <Notice>
            Chi trả hiện dùng chuyển khoản thủ công có đối soát. Xem người nhận chỉ sau xác thực
            lại. Nếu bật kiểm soát kép, người chuyển tiền phải khác người duyệt.
          </Notice>
        )}
        {tab === 'withdrawals' && (
          <Field label="Loại yêu cầu">
            <select
              className={inputClass}
              value={requestType}
              onChange={(event) => {
                setRequestType(event.target.value);
                setPage(0);
              }}
            >
              <option value="">Tất cả yêu cầu</option>
              <option value="EARLY">Ticket xin rút sớm</option>
              <option value="NORMAL">Rút tiền thông thường</option>
            </select>
          </Field>
        )}
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
                  {w.requestType === 'EARLY' && (
                    <p className="text-sm font-semibold text-amber-700">Ticket xin rút tiền sớm</p>
                  )}
                  <p className="text-sm text-slate-500">
                    {w.bankCode} · •••• {w.lastFour} · {statusLabel[w.status]}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-400">
                    {w.id} · {dateTime(w.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  <button
                    type="button"
                    disabled={detailLoading}
                    className={secondaryClass}
                    onClick={() => void loadWithdrawal(w.id)}
                  >
                    Xem chi tiết{w.requestType === 'EARLY' ? ' & bằng chứng' : ''}
                  </button>
                  {w.status === 'REQUESTED' && (
                    <button
                      type="button"
                      className={primaryClass}
                      onClick={() =>
                        w.requestType === 'EARLY'
                          ? void loadWithdrawal(w.id)
                          : open(w.id, 'approve')
                      }
                    >
                      {w.requestType === 'EARLY' ? 'Xem để duyệt chi sớm' : 'Duyệt chi'}
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
        {withdrawalDetail && !operation && (
          <Modal title="Chi tiết yêu cầu chi trả" onClose={() => setWithdrawalDetail(null)}>
            <p className="text-2xl font-bold">{money(withdrawalDetail.amount)}</p>
            <p className="text-sm">
              {withdrawalDetail.bankCode} · •••• {withdrawalDetail.lastFour} ·{' '}
              {statusLabel[withdrawalDetail.status]}
            </p>
            <WithdrawalEvidence withdrawal={withdrawalDetail} />
            <PayoutReceipts withdrawal={withdrawalDetail} />
            <ol className="space-y-2 border-l-2 border-blue-100 pl-3">
              {withdrawalDetail.history?.map((event, index) => (
                <li key={`${event.createdAt}-${index}`} className="text-sm">
                  <span className="text-xs text-slate-500">{dateTime(event.createdAt)}</span>
                  <p>{event.detail}</p>
                </li>
              ))}
            </ol>
            {withdrawalDetail.status === 'REQUESTED' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={withdrawalDetail.project?.blocked}
                  className={primaryClass}
                  onClick={() => open(withdrawalDetail.id, 'approve')}
                >
                  Duyệt chi{withdrawalDetail.requestType === 'EARLY' ? ' sớm' : ''}
                </button>
                <button
                  type="button"
                  className={secondaryClass}
                  onClick={() => open(withdrawalDetail.id, 'reject')}
                >
                  Từ chối
                </button>
              </div>
            )}
          </Modal>
        )}
        {operation && (
          <Modal
            title="Xác nhận thao tác tài chính"
            onClose={() => {
              setOperation(null);
              setPassword('');
              setReceiptFiles([]);
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
              {(!['reveal-bank', 'start-manual-payment', 'approve'].includes(operation.type) ||
                (operation.type === 'approve' && withdrawalDetail?.requestType === 'EARLY')) && (
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
                  <PayoutReceiptUpload
                    files={receiptFiles}
                    onChange={setReceiptFiles}
                    onError={setError}
                    disabled={busy}
                  />
                  <Notice>
                    Chỉ xác nhận khi đã đối chiếu số tiền, người nhận và kết quả ngân hàng. Nếu chưa
                    rõ kết quả, chuyển sang đối soát để tránh chi trùng.
                  </Notice>
                </>
              )}
              {error && <Notice error>{error}</Notice>}
              <button
                type="submit"
                disabled={
                  busy || (operation.type === 'confirm-manual-payment' && !receiptFiles.length)
                }
                className={primaryClass}
              >
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
      </div>
    </div>
  );
}

const financeTitles: Record<string, string> = {
  banks: 'Xác minh tài khoản ngân hàng',
  withdrawals: 'Chi trả freelancer',
  tickets: 'Ticket bảo trì',
  receipts: 'Đối soát tiền vào',
  'checkout-review': 'Đối soát gói & giao dịch',
  'payment-cases': 'Hồ sơ sự cố thanh toán',
  audit: 'Nhật ký vận hành',
};
const financeDescriptions: Record<string, string> = {
  banks: 'Xác minh người thụ hưởng trước khi xử lý các yêu cầu chi trả.',
  withdrawals: 'Theo dõi yêu cầu rút thu nhập và đối soát các lệnh chuyển tiền.',
  tickets: 'Quản lý yêu cầu bảo trì và các vấn đề phát sinh sau nghiệm thu.',
  receipts: 'Đối chiếu các khoản tiền vào và giao dịch cần xác minh.',
  'checkout-review': 'Theo dõi các đơn thanh toán và quyền lợi đang chờ hoàn tất.',
  'payment-cases':
    'Xử lý giao dịch cần hỗ trợ. Mọi quyết định và bằng chứng đều được lưu trong lịch sử.',
  audit: 'Tra cứu lịch sử thao tác và quyết định trong quy trình tài chính.',
};
export default function AdminFinancePage() {
  const { section = 'payment-cases' } = useParams();
  const userId = useAuthStore((state) => state.user?.userId);
  if (!financeTitles[section]) return <Navigate to="/admin/finance/payment-cases" replace />;
  return <AdminFinanceContent key={`${userId}:${section}`} tab={section} />;
}
