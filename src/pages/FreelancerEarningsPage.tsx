import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, Clock3, Landmark, LockKeyhole, Wallet } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  type Withdrawal,
  dateTime,
  financeApi,
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
import { useAuthStore } from '../stores/useAuthStore';

export default function FreelancerEarningsPage() {
  const userId = useAuthStore((s) => s.user?.userId);
  const cache = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState<'bank' | 'withdraw' | 'disable' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [bankCode, setBankCode] = useState('VCB');
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [bankId, setBankId] = useState('');
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<Withdrawal | null>(null);
  const requestKey = useRef(crypto.randomUUID());
  const wallet = useQuery({
    queryKey: ['finance', userId, 'wallet'],
    queryFn: financeApi.wallet,
    refetchInterval: 30000,
  });
  const banks = useQuery({ queryKey: ['finance', userId, 'banks'], queryFn: financeApi.banks });
  const withdrawals = useQuery({
    queryKey: ['finance', userId, 'withdrawals', page],
    queryFn: () => financeApi.withdrawals(page),
    refetchInterval: 30000,
  });
  const journals = useQuery({
    queryKey: ['finance', userId, 'journals', page],
    queryFn: () => financeApi.journals(page),
    enabled: tab === 'history',
  });
  const refresh = () => cache.invalidateQueries({ queryKey: ['finance', userId] });
  const open = (kind: 'bank' | 'withdraw' | 'disable') => {
    setError('');
    setPassword('');
    setModal(kind);
    if (kind === 'withdraw') {
      setBankId('');
      setAmount('');
    }
    requestKey.current = crypto.randomUUID();
  };
  const close = () => {
    setModal(null);
    setPassword('');
    setNumber('');
    setHolder('');
    setError('');
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (modal === 'bank')
        await financePost('/finance/bank-accounts', {
          bankCode,
          accountNumber: number,
          accountHolder: holder,
          password,
        });
      else if (modal === 'disable')
        await financePost(`/finance/bank-accounts/${bankId}/disable`, { password });
      else
        await financePost('/finance/withdrawals', {
          bankAccountId: bankId,
          requestKey: requestKey.current,
          amount: Number(amount),
          password,
        });
      setNotice(
        modal === 'disable'
          ? 'Đã ngừng sử dụng tài khoản nhận tiền.'
          : modal === 'bank'
            ? 'Đã thêm tài khoản. Bạn có thể rút tiền sau khi tài khoản được xác minh.'
            : 'Đã tạo yêu cầu rút. Số tiền được giữ riêng để chờ duyệt, chưa chuyển về ngân hàng.'
      );
      close();
      await refresh();
    } catch (cause) {
      setError(financeError(cause));
    } finally {
      setBusy(false);
      setPassword('');
    }
  };
  const loadDetail = async (id: string) => {
    try {
      setDetail(await financeGet<Withdrawal>(`/finance/withdrawals/${id}`));
    } catch (cause) {
      setNotice(financeError(cause));
    }
  };
  const data = wallet.data;
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-700">TÀI CHÍNH CỦA BẠN</p>
            <h1 className="mt-2 text-3xl font-bold">Thu nhập & công nợ</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Theo dõi tiền theo từng dự án, tài khoản nhận tiền và tiến trình chi trả.
            </p>
          </div>
          <button
            type="button"
            className={primaryClass}
            onClick={() => open('withdraw')}
            disabled={
              !data?.withdrawalsEnabled ||
              !data.availableBalance ||
              !banks.data?.some((b) => b.status === 'VERIFIED')
            }
          >
            <ArrowUpRight size={16} className="mr-2" />
            Yêu cầu rút tiền
          </button>
        </div>
        <div className="my-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
          <LockKeyhole size={20} className="mt-0.5 shrink-0" />
          <p>
            Tiền được ghi công nợ ngay sau nghiệm thu. Bạn chỉ có thể rút sau{' '}
            <strong>7 ngày bảo trì</strong> và khi các ticket liên quan đã được giải quyết. Hoàn cọc
            được theo dõi riêng với thù lao.
          </p>
        </div>
        {notice && (
          <div className="mb-4">
            <Notice>{notice}</Notice>
          </div>
        )}
        {(wallet.isError || banks.isError || withdrawals.isError) && (
          <Notice error>
            Không tải được dữ liệu tài chính.{' '}
            <button type="button" className="underline" onClick={() => void refresh()}>
              Thử lại
            </button>
          </Notice>
        )}
        {wallet.isPending ? (
          <p className="py-8 text-slate-500">Đang tải công nợ…</p>
        ) : (
          data && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  ['Khả dụng', data.availableBalance, Wallet],
                  ['Chờ hết hạn bảo trì', data.pendingBalance, Clock3],
                  ['Đang giữ do ticket', data.heldBalance, LockKeyhole],
                  ['Đang chờ chi trả', data.reservedBalance, Landmark],
                ].map(([label, value, Icon]) => {
                  const StatIcon = Icon as typeof Wallet;
                  return (
                    <div
                      key={String(label)}
                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <StatIcon size={18} className="mb-4 text-blue-700" />
                      <p className="text-xs text-slate-500">{String(label)}</p>
                      <p className="mt-1 text-xl font-bold">{money(Number(value))}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <span>
                  Giá trị hợp đồng đang ký quỹ: <strong>{money(data.escrowGross)}</strong>
                </span>
                <span>
                  Cọc đang giữ: <strong>{money(data.lockedDeposit)}</strong>
                </span>
                <span>
                  Đã chuyển ngân hàng: <strong>{money(data.paidTotal)}</strong>
                </span>
              </div>
              {data.sandboxBalance > 0 && (
                <p className="mt-3 text-xs text-slate-500">
                  Số dư mô phỏng: {money(data.sandboxBalance)}. Khoản này không được rút thành tiền
                  thật.
                </p>
              )}
              {!data.withdrawalsEnabled && (
                <p className="mt-3 text-sm text-slate-500">
                  Chi trả ngân hàng chưa được mở. Công nợ và lịch sử vẫn được lưu đầy đủ.
                </p>
              )}
            </>
          )
        )}
        <div className="my-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">
          {[
            ['overview', 'Theo dự án'],
            ['banks', 'Tài khoản nhận tiền'],
            ['withdrawals', 'Yêu cầu rút'],
            ['history', 'Lịch sử giao dịch'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              className={tab === key ? primaryClass : secondaryClass}
              onClick={() => {
                setTab(key);
                setPage(0);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === 'overview' && (
          <div className="space-y-3">
            {data?.payables.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                Chưa có công nợ. Các khoản sẽ xuất hiện sau khi khách hàng nghiệm thu dự án.
              </div>
            )}
            {data?.payables.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5"
              >
                <div>
                  <Link
                    to={`/workspace/${p.jobId}`}
                    className="font-semibold text-slate-900 hover:text-blue-700"
                  >
                    {p.jobTitle}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    Nghiệm thu {dateTime(p.acceptedAt)} · Hết hạn bảo trì {dateTime(p.availableAt)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Thù lao {money(p.earnings)} · Hoàn cọc {money(p.depositRefund)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{money(p.amount - p.paid - p.adjusted)}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${p.sandbox ? 'bg-slate-100 text-slate-600' : p.blocked ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}
                  >
                    {p.sandbox
                      ? 'Mô phỏng'
                      : p.blocked
                        ? 'Đang giữ do ticket'
                        : new Date(p.availableAt) > new Date()
                          ? 'Chờ hết hạn bảo trì'
                          : p.paid >= p.amount - p.adjusted
                            ? 'Đã chi trả'
                            : 'Đủ hạn bảo trì'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'banks' && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Thông tin được mã hóa khi lưu. Thay người nhận bằng cách thêm tài khoản mới để xác
                minh.
              </p>
              <button type="button" className={secondaryClass} onClick={() => open('bank')}>
                Thêm tài khoản
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {banks.data?.map((bank) => (
                <div key={bank.id} className="rounded-2xl border border-slate-100 bg-white p-5">
                  <Landmark className="mb-3 text-blue-700" size={22} />
                  <p className="font-semibold">
                    {bank.bankCode} · •••• {bank.lastFour}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{statusLabel[bank.status]}</p>
                  {bank.verificationNote && (
                    <p className="mt-2 text-xs text-slate-500">{bank.verificationNote}</p>
                  )}
                  {bank.status !== 'DISABLED' && (
                    <button
                      type="button"
                      className="mt-4 text-sm font-medium text-slate-600 underline"
                      onClick={() => {
                        open('bank');
                        setBankCode(bank.bankCode);
                        setNotice(
                          'Để thay tài khoản, hãy thêm thông tin mới. Tài khoản đang dùng vẫn giữ nguyên cho yêu cầu đã tạo.'
                        );
                      }}
                    >
                      Thay tài khoản nhận tiền
                    </button>
                  )}
                  {bank.status !== 'DISABLED' && (
                    <button
                      type="button"
                      className="ml-4 mt-4 text-sm text-slate-500 underline"
                      onClick={() => {
                        open('disable');
                        setBankId(bank.id);
                      }}
                    >
                      Ngừng sử dụng
                    </button>
                  )}
                </div>
              ))}
            </div>
            {banks.data?.length === 0 && (
              <Notice>
                Chưa có tài khoản nhận tiền. Hãy thêm tài khoản đứng tên bạn để gửi xác minh.
              </Notice>
            )}
          </div>
        )}
        {tab === 'withdrawals' && (
          <div className="space-y-3">
            {withdrawals.data?.length === 0 && <Notice>Chưa có yêu cầu rút tiền.</Notice>}
            {withdrawals.data?.map((w) => (
              <button
                type="button"
                key={w.id}
                onClick={() => void loadDetail(w.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-5 text-left hover:border-blue-200"
              >
                <div>
                  <p className="font-semibold">
                    {w.bankCode} · •••• {w.lastFour}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {dateTime(w.createdAt)} · {w.id.slice(0, 8)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{money(w.amount)}</p>
                  <p className="mt-1 text-xs text-blue-700">{statusLabel[w.status] || w.status}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {tab === 'history' && (
          <div className="space-y-3">
            {journals.isError && <Notice error>Không tải được lịch sử giao dịch.</Notice>}
            {journals.data?.length === 0 && <Notice>Chưa có giao dịch.</Notice>}
            {journals.data?.map((j) => (
              <div key={j.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="font-medium">
                  {j.description}
                  {j.sandbox ? ' · Mô phỏng' : ''}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {dateTime(j.createdAt)} · {j.id.slice(0, 8)}
                  {j.payableChange !== 0
                    ? ` · Biến động công nợ: ${j.payableChange > 0 ? '+' : ''}${money(j.payableChange)}`
                    : ` · Giá trị giao dịch: ${money(j.grossAmount)}`}
                </p>
              </div>
            ))}
          </div>
        )}
        {['history', 'withdrawals'].includes(tab) && (
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              className={secondaryClass}
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </button>
            <span className="self-center text-sm">Trang {page + 1}</span>
            <button
              type="button"
              className={secondaryClass}
              disabled={(tab === 'history' ? journals.data : withdrawals.data)?.length !== 25}
              onClick={() => setPage((p) => p + 1)}
            >
              Tiếp
            </button>
          </div>
        )}
        {modal && (
          <Modal
            title={
              modal === 'bank'
                ? 'Thêm tài khoản nhận tiền'
                : modal === 'disable'
                  ? 'Ngừng sử dụng tài khoản'
                  : 'Yêu cầu rút tiền'
            }
            onClose={close}
            busy={busy}
          >
            <form onSubmit={(event) => void submit(event)} className="space-y-4">
              {modal === 'bank' ? (
                <>
                  <Field
                    label="Mã ngân hàng"
                    hint="Ví dụ VCB, ACB, MBB, BIDV. Đối chiếu với ngân hàng nhận tiền của bạn."
                  >
                    <input
                      required
                      maxLength={20}
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value.toUpperCase())}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Số tài khoản">
                    <input
                      required
                      autoComplete="off"
                      inputMode="numeric"
                      maxLength={40}
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label="Tên chủ tài khoản"
                    hint="Nhập đúng tên người thụ hưởng đã đăng ký tại ngân hàng."
                  >
                    <input
                      required
                      autoComplete="name"
                      maxLength={150}
                      value={holder}
                      onChange={(e) => setHolder(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : modal === 'disable' ? (
                <Notice>
                  Tài khoản không dùng cho yêu cầu mới. Thông tin người nhận của lệnh đã tạo được
                  giữ nguyên.
                </Notice>
              ) : (
                <>
                  <Field label="Tài khoản nhận tiền">
                    <select
                      required
                      value={bankId}
                      onChange={(e) => {
                        setBankId(e.target.value);
                        requestKey.current = crypto.randomUUID();
                      }}
                      className={inputClass}
                    >
                      <option value="">Chọn tài khoản đã xác minh</option>
                      {banks.data
                        ?.filter((b) => b.status === 'VERIFIED')
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.bankCode} · •••• {b.lastFour}
                          </option>
                        ))}
                    </select>
                  </Field>
                  <Field
                    label="Số tiền rút (VND)"
                    hint={`Khả dụng: ${money(data?.availableBalance || 0)} · Tối thiểu: ${money(data?.minimumWithdrawal || 0)}`}
                  >
                    <input
                      required
                      type="number"
                      min={data?.minimumWithdrawal || 1}
                      step={1}
                      max={data?.availableBalance || 0}
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        requestKey.current = crypto.randomUUID();
                      }}
                      className={inputClass}
                    />
                  </Field>
                  <Notice>
                    Yêu cầu sẽ chờ duyệt. Chỉ xác nhận đã chuyển khi giao dịch ngân hàng được đối
                    soát.
                  </Notice>
                </>
              )}
              <Field
                label="Mật khẩu hiện tại"
                hint="Xác thực lại để bảo vệ thông tin nhận tiền và giao dịch của bạn."
              >
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  maxLength={200}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </Field>
              {error && <Notice error>{error}</Notice>}
              <div className="flex justify-end gap-2">
                <button type="button" disabled={busy} onClick={close} className={secondaryClass}>
                  Hủy
                </button>
                <button type="submit" disabled={busy} className={primaryClass}>
                  {busy
                    ? 'Đang gửi…'
                    : modal === 'bank'
                      ? 'Gửi xác minh'
                      : modal === 'disable'
                        ? 'Xác nhận ngừng sử dụng'
                        : 'Xác nhận yêu cầu'}
                </button>
              </div>
            </form>
          </Modal>
        )}
        {detail && (
          <Modal title="Chi tiết yêu cầu rút" onClose={() => setDetail(null)}>
            <p className="text-2xl font-bold">{money(detail.amount)}</p>
            <p className="text-sm text-slate-600">
              {detail.bankCode} · •••• {detail.lastFour} · {statusLabel[detail.status]}
            </p>
            <p className="break-all text-xs text-slate-400">{detail.id}</p>
            <ol className="space-y-3 border-l-2 border-blue-100 pl-4">
              {detail.history?.map((event, index) => (
                <li key={`${event.createdAt}-${index}`}>
                  <p className="text-xs text-slate-400">{dateTime(event.createdAt)}</p>
                  <p className="text-sm font-medium">{statusLabel[event.action] || event.action}</p>
                  <p className="text-sm text-slate-600">{event.detail}</p>
                </li>
              ))}
            </ol>
            {detail.status === 'REQUESTED' && (
              <button
                type="button"
                disabled={busy}
                className={secondaryClass}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await financePost(`/finance/withdrawals/${detail.id}/cancel`);
                    setDetail(null);
                    await refresh();
                  } catch (cause) {
                    setNotice(financeError(cause));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Hủy yêu cầu chưa duyệt
              </button>
            )}
          </Modal>
        )}
      </main>
    </div>
  );
}
