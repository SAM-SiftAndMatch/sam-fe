import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { dateTime, financeError, financeGet, financePost, money } from '../../api/finance';
import { Field, Modal, Notice, inputClass, primaryClass, secondaryClass } from './FinanceUI';

interface PaymentCase {
  id: string;
  checkoutId?: string;
  eventId?: string;
  supportCode?: string;
  amount?: number;
  environment?: string;
  reason: string;
  state: string;
  assigneeId?: string;
  dueAt: string;
  resolution?: string;
}
const reasonLabels: Record<string, string> = {
  CREATE_UNKNOWN: 'Chưa rõ kết quả tạo thanh toán',
  CREATE_STUCK: 'Tạo thanh toán quá thời gian dự kiến',
  LEGACY_UNCERTAIN: 'Đơn cũ cần xác minh',
  CHECKOUT_EXPIRED: 'Liên kết hết hạn, cần kiểm tra trước khi tạo lại',
  FULFILLMENT_STUCK: 'Đã nhận tiền, kích hoạt cần hỗ trợ',
  INBOX_STUCK: 'Thông báo thanh toán chưa xử lý xong',
  UNMATCHED_ORDER: 'Chưa tìm thấy đơn tương ứng',
  UNDERPAID: 'Số tiền nhận chưa đủ',
  OVERPAID: 'Số tiền nhận vượt giá thanh toán',
  LATE_OR_DUPLICATE_PAYMENT: 'Tiền đến muộn hoặc thanh toán thêm',
  INVOICE_RECEIPT_CONFLICT: 'Thông tin thanh toán có mâu thuẫn',
  PROVIDER_CANCELLED: 'Pay2S thông báo hủy đơn',
  LOCAL_CONFIGURATION_REJECTED: 'Cấu hình thanh toán cần điều chỉnh',
  LATE_CREATE_RESPONSE: 'Pay2S trả kết quả sau khi đơn đã được xử lý',
  MERCHANT_CHANGED: 'Cấu hình tài khoản nhận tiền đã thay đổi',
  MERCHANT_MISMATCH: 'Tài khoản nhận tiền chưa khớp hồ sơ',
};
const actions = [
  ['CLAIM', 'Nhận xử lý'],
  ['NOTE', 'Ghi bằng chứng / cập nhật'],
  ['RETRY_EVENT', 'Kiểm tra lại thông báo đã lưu'],
  ['PROPOSE_PROVIDER_CLOSED', 'Đề nghị xác nhận Pay2S đã đóng, chưa nhận tiền'],
  ['APPROVE_PROVIDER_CLOSED', 'Admin thứ hai duyệt xác nhận chưa nhận tiền'],
  ['PROPOSE_LATE_ALLOCATION', 'Đề nghị phân bổ khoản trả muộn đúng giá'],
  ['APPROVE_LATE_ALLOCATION', 'Admin thứ hai duyệt phân bổ khoản trả muộn'],
] as const;

export default function PaymentCasesPanel({ owner }: { owner: string }) {
  const cache = useQueryClient();
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<PaymentCase | null>(null);
  const [action, setAction] = useState<string>('CLAIM');
  const [password, setPassword] = useState('');
  const [evidence, setEvidence] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useQuery({
    queryKey: ['payment-cases', owner, page],
    queryFn: () => financeGet<PaymentCase[]>(`/checkouts/admin/cases?page=${page}`),
    refetchInterval: 15000,
  });
  const history = useQuery({
    queryKey: ['payment-case-events', owner, selected?.id],
    queryFn: () =>
      financeGet<
        { action: string; actorId?: string; evidenceReference?: string; createdAt: string }[]
      >(`/checkouts/admin/cases/${selected!.id}/events`),
    enabled: Boolean(selected),
  });
  const close = () => {
    setSelected(null);
    setPassword('');
    setEvidence('');
    setError('');
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || busy) return;
    setBusy(true);
    setError('');
    try {
      await financePost(`/checkouts/admin/cases/${selected.id}/actions`, {
        action,
        password,
        evidenceReference: evidence,
      });
      await cache.invalidateQueries({ queryKey: ['payment-cases', owner] });
      close();
    } catch (cause) {
      setError(financeError(cause));
    } finally {
      setBusy(false);
      setPassword('');
    }
  };
  return (
    <section className="space-y-4">
      <Notice>
        Đối chiếu Pay2S và ngân hàng trước khi quyết định. Xác nhận đơn đã đóng hoặc phân bổ tiền
        muộn cần hai admin khác nhau. Hồ sơ này không tự thực hiện hoàn tiền.
      </Notice>
      {list.isError && (
        <Notice error>
          Không tải được hồ sơ.{' '}
          <button type="button" className="underline" onClick={() => void list.refetch()}>
            Thử lại
          </button>
        </Notice>
      )}
      {list.isPending && <p>Đang tải hồ sơ…</p>}
      {list.data?.length === 0 && <Notice>Chưa có hồ sơ đối soát.</Notice>}
      {list.data?.map((item) => (
        <article
          key={item.id}
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <p className="font-semibold break-all">{item.supportCode || item.id}</p>
          <p>
            {reasonLabels[item.reason] || 'Giao dịch cần xác minh'} ·{' '}
            {item.environment || 'Thông báo chưa khớp'} ·{' '}
            {item.amount == null ? 'Chưa phân bổ' : money(item.amount)}
          </p>
          <p
            className={
              item.state !== 'RESOLVED' && Date.parse(item.dueAt) < Date.now()
                ? 'text-red-700'
                : 'text-slate-500'
            }
          >
            {item.state === 'RESOLVED'
              ? `Đã xử lý: ${item.resolution}`
              : `Hạn xử lý: ${dateTime(item.dueAt)}`}
          </p>
          <p className="text-sm text-slate-500">
            Người phụ trách: {item.assigneeId || 'Chưa nhận'}
          </p>
          <button
            type="button"
            className={secondaryClass}
            onClick={() => {
              setSelected(item);
              setAction('CLAIM');
              setError('');
            }}
          >
            Chi tiết và xử lý
          </button>
        </article>
      ))}
      <div className="flex gap-3">
        <button
          type="button"
          className={secondaryClass}
          disabled={page === 0}
          onClick={() => setPage((v) => v - 1)}
        >
          Trang trước
        </button>
        <button
          type="button"
          className={secondaryClass}
          disabled={!list.data || list.data.length < 20}
          onClick={() => setPage((v) => v + 1)}
        >
          Trang sau
        </button>
      </div>
      {selected && (
        <Modal title="Hồ sơ đối soát thanh toán" onClose={close}>
          <div className="mb-4 max-h-60 space-y-3 overflow-auto text-sm">
            {history.data?.map((item, index) => (
              <p key={`${item.createdAt}:${index}`}>
                {dateTime(item.createdAt)} · {item.action}
                <br />
                {item.actorId || 'Hệ thống'}
                <br />
                {item.evidenceReference}
              </p>
            ))}
          </div>
          {history.isError && <Notice error>Chưa tải được lịch sử hồ sơ.</Notice>}
          {selected.state !== 'RESOLVED' && (
            <form onSubmit={submit} className="space-y-4">
              <Field label="Thao tác">
                <select
                  className={inputClass}
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  {actions
                    .filter(([value]) => selected.eventId || value !== 'RETRY_EVENT')
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                </select>
              </Field>
              <Field
                label="Bằng chứng / ghi chú"
                hint="Dùng mã chứng từ nội bộ. Không nhập khóa Pay2S hoặc thông tin ngân hàng đầy đủ."
              >
                <textarea
                  className={inputClass}
                  required={action !== 'CLAIM'}
                  maxLength={500}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                />
              </Field>
              <Field label="Xác thực lại mật khẩu">
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={200}
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {error && <Notice error>{error}</Notice>}
              <button type="submit" disabled={busy} className={primaryClass}>
                {busy ? 'Đang xử lý…' : 'Ghi nhận thao tác'}
              </button>
            </form>
          )}
        </Modal>
      )}
    </section>
  );
}
