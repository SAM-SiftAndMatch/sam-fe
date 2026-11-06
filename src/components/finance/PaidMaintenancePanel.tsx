import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { dateTime, financeError, financeGet, financePost, money } from '../../api/finance';
import { beginCheckout } from '../../lib/checkout';
import { useAuthStore } from '../../stores/useAuthStore';
import { Field, Modal, Notice, inputClass, primaryClass, secondaryClass } from './FinanceUI';

export interface MaintenanceQuote {
  id: string;
  amount: number;
  deliveryDays: number;
  scope: string;
  status: string;
  createdAt: string;
}
export interface MaintenanceOrder {
  id: string;
  ticketId: string;
  scope: string;
  amount: number;
  status: string;
  dueAt?: string;
  completedAt?: string;
  submittedResult?: string;
}
const orderLabels: Record<string, string> = {
  AWAITING_PAYMENT: 'Chờ thanh toán',
  FUNDED: 'Đã xác nhận tiền',
  IN_PROGRESS: 'Đang thực hiện',
  SUBMITTED: 'Chờ nghiệm thu',
  COMPLETED: 'Đã nghiệm thu',
  DISPUTED: 'Cần hỗ trợ',
};
export function QuotePanel({
  ticketId,
  viewerRole,
  onChanged,
}: { ticketId: string; viewerRole: string; onChanged: () => void }) {
  const user = useAuthStore((s) => s.user?.userId);
  const cache = useQueryClient();
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('7');
  const [scope, setScope] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const quotes = useQuery({
    queryKey: ['paid-maintenance', user, 'quotes', ticketId],
    queryFn: () => financeGet<MaintenanceQuote[]>(`/maintenance-tickets/${ticketId}/quotes`),
    refetchInterval: 30000,
  });
  const execute = async (path: string, body: unknown) => {
    setBusy(true);
    setError('');
    try {
      await financePost(path, body);
      await cache.invalidateQueries({ queryKey: ['paid-maintenance', user] });
      onChanged();
    } catch (cause) {
      setError(financeError(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="space-y-3 rounded-xl border border-blue-100 p-4">
      <h3 className="font-semibold">Báo giá bảo trì riêng</h3>
      <Notice>
        Chấp thuận báo giá chỉ tạo đơn hàng, chưa thu tiền. Phí nền tảng 10%; đơn mới có 7 ngày bảo
        trì sau nghiệm thu. Công nợ dự án gốc được giữ nguyên.
      </Notice>
      {quotes.isError && <Notice error>Không tải được báo giá.</Notice>}
      {quotes.data?.map((q) => (
        <div key={q.id} className="space-y-2 rounded-xl bg-slate-50 p-3">
          <p className="font-semibold">
            {money(q.amount)} · {q.deliveryDays} ngày thực hiện
          </p>
          <p className="whitespace-pre-wrap text-sm">{q.scope}</p>
          <p className="text-xs text-slate-500">
            {q.status === 'QUOTED'
              ? 'Đang chờ chấp thuận'
              : q.status === 'ACCEPTED'
                ? 'Đã chấp thuận'
                : 'Báo giá đã được thay thế'}
          </p>
          {viewerRole === 'client' && q.status === 'QUOTED' && (
            <button
              type="button"
              className={primaryClass}
              disabled={busy}
              onClick={() => void execute(`/maintenance-quotes/${q.id}/accept`, {})}
            >
              Đồng ý phạm vi, giá và điều kiện
            </button>
          )}
        </div>
      ))}
      {viewerRole === 'freelancer' && !quotes.data?.some((q) => q.status === 'ACCEPTED') && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void execute(`/maintenance-tickets/${ticketId}/quotes`, {
              amount: Number(amount),
              deliveryDays: Number(days),
              scope,
            });
          }}
        >
          <Field label="Giá trọn gói (VND)">
            <input
              type="number"
              min={1}
              step={1}
              required
              max={1000000000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Số ngày thực hiện sau khi thanh toán">
            <input
              type="number"
              min={1}
              max={90}
              required
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Phạm vi và kết quả bàn giao">
            <textarea
              required
              rows={4}
              maxLength={8000}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className={inputClass}
            />
          </Field>
          <button type="submit" disabled={busy} className={primaryClass}>
            Gửi báo giá
          </button>
        </form>
      )}
      {error && <Notice error>{error}</Notice>}
    </section>
  );
}
export default function PaidMaintenancePanel({
  scopeId,
  viewerRole,
  onOpenWarranty,
}: { scopeId: string; viewerRole: string; onOpenWarranty: (order: string) => void }) {
  const user = useAuthStore((s) => s.user?.userId);
  const cache = useQueryClient();
  const [selected, setSelected] = useState<MaintenanceOrder | null>(null);
  const [content, setContent] = useState('');
  const [action, setAction] = useState('SUBMIT');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const orders = useQuery({
    queryKey: ['paid-maintenance', user, 'orders', scopeId],
    queryFn: () => financeGet<MaintenanceOrder[]>(`/projects/${scopeId}/paid-maintenance-orders`),
    refetchInterval: 30000,
  });
  const checkout = async (order: string) => {
    setBusy(true);
    setError('');
    try {
      const payment = await financePost<{ checkoutUrl?: string; orderId?: string }>(
        `/paid-maintenance-orders/${order}/checkout`
      );
      beginCheckout(payment, window.location.pathname);
    } catch (cause) {
      setError(financeError(cause));
    } finally {
      setBusy(false);
    }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      await financePost(`/paid-maintenance-orders/${selected.id}/actions`, { action, content });
      setSelected(null);
      setContent('');
      await cache.invalidateQueries({ queryKey: ['paid-maintenance', user] });
      await cache.invalidateQueries({ queryKey: ['maintenance', user] });
    } catch (cause) {
      setError(financeError(cause));
    } finally {
      setBusy(false);
    }
  };
  if (!orders.data?.length && !orders.isError) return null;
  return (
    <section className="mt-3 space-y-3 border-t border-slate-100 pt-3">
      <h3 className="text-sm font-semibold">Đơn bảo trì có phí</h3>
      {orders.isError && <Notice error>Không tải được đơn bảo trì.</Notice>}
      {orders.data?.map((order) => (
        <div
          key={order.id}
          className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3"
        >
          <p className="text-sm font-semibold">
            {money(order.amount)} · {orderLabels[order.status] || order.status}
          </p>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{order.scope}</p>
          {order.submittedResult && (
            <div className="rounded-lg bg-white p-3">
              <p className="mb-1 text-xs font-semibold text-slate-500">Bàn giao gần nhất</p>
              <p className="whitespace-pre-wrap text-sm">{order.submittedResult}</p>
            </div>
          )}
          {order.dueAt && (
            <p className="text-xs text-slate-500">Hạn thực hiện: {dateTime(order.dueAt)}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {viewerRole === 'client' && order.status === 'AWAITING_PAYMENT' && (
              <button
                type="button"
                className={primaryClass}
                disabled={busy}
                onClick={() => void checkout(order.id)}
              >
                Thanh toán đơn bảo trì
              </button>
            )}
            {viewerRole === 'freelancer' && ['FUNDED', 'IN_PROGRESS'].includes(order.status) && (
              <button
                type="button"
                className={secondaryClass}
                onClick={() => {
                  setSelected(order);
                  setContent('');
                  setAction('SUBMIT');
                }}
              >
                Gửi kết quả bàn giao
              </button>
            )}
            {viewerRole === 'client' && order.status === 'SUBMITTED' && (
              <button
                type="button"
                className={primaryClass}
                onClick={() => {
                  setSelected(order);
                  setContent('');
                  setAction('ACCEPT');
                }}
              >
                Kiểm tra và nghiệm thu
              </button>
            )}
            {viewerRole === 'admin' && ['DISPUTED', 'SUBMITTED'].includes(order.status) && (
              <button
                type="button"
                className={secondaryClass}
                onClick={() => {
                  setSelected(order);
                  setContent('');
                  setAction(order.status === 'DISPUTED' ? 'ADMIN_RESUME' : 'ADMIN_COMPLETE');
                }}
              >
                Xử lý đơn bảo trì
              </button>
            )}
            {order.status === 'COMPLETED' && (
              <button
                type="button"
                className={secondaryClass}
                onClick={() => onOpenWarranty(order.id)}
              >
                Bảo trì của đơn này
              </button>
            )}
          </div>
        </div>
      ))}
      {error && !selected && <Notice error>{error}</Notice>}
      {selected && (
        <Modal title="Cập nhật đơn bảo trì" onClose={() => setSelected(null)} busy={busy}>
          <form className="space-y-4" onSubmit={(e) => void submit(e)}>
            <p className="whitespace-pre-wrap text-sm">{selected.scope}</p>
            <Field label="Thao tác">
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className={inputClass}
              >
                {viewerRole === 'admin' ? (
                  <>
                    {selected.status === 'DISPUTED' && (
                      <option value="ADMIN_RESUME">Tiếp tục thực hiện theo kết luận xử lý</option>
                    )}
                    <option value="ADMIN_COMPLETE">Xác nhận hoàn tất theo bằng chứng</option>
                  </>
                ) : viewerRole === 'client' ? (
                  <>
                    <option value="ACCEPT">Nghiệm thu kết quả</option>
                    <option value="REVISION">Yêu cầu chỉnh sửa theo phạm vi</option>
                  </>
                ) : (
                  <option value="SUBMIT">Gửi kết quả để khách hàng kiểm tra</option>
                )}
                <option value="ESCALATE">Cần hỗ trợ xử lý bất đồng</option>
              </select>
            </Field>
            <Field label="Kết quả, bằng chứng hoặc lý do">
              <textarea
                required
                maxLength={8000}
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={inputClass}
              />
            </Field>
            {['ACCEPT', 'ADMIN_COMPLETE'].includes(action) && (
              <Notice>
                Nghiệm thu ghi công nợ riêng và bắt đầu 7 ngày bảo trì cho đơn này. Không thay đổi
                thời hạn hoặc tiền của dự án gốc.
              </Notice>
            )}
            {error && <Notice error>{error}</Notice>}
            <button type="submit" disabled={busy} className={primaryClass}>
              Xác nhận cập nhật
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
