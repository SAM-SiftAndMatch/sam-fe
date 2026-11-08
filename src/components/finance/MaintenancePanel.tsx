import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareWarning, ShieldCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  type MaintenanceTicket,
  dateTime,
  financeApi,
  financeError,
  financePost,
  statusLabel,
} from '../../api/finance';
import { useAuthStore } from '../../stores/useAuthStore';
import { Field, Modal, Notice, inputClass, primaryClass, secondaryClass } from './FinanceUI';
import PaidMaintenancePanel, { QuotePanel } from './PaidMaintenancePanel';

export default function MaintenancePanel({
  jobId,
  completed,
  viewerRole,
  includePaid = true,
}: {
  jobId: string;
  completed: boolean;
  viewerRole: 'client' | 'freelancer' | 'admin';
  includePaid?: boolean;
}) {
  const user = useAuthStore((s) => s.user?.userId);
  const cache = useQueryClient();
  const [listOpen, setListOpen] = useState(false);
  const [creating, setCreating] = useState<'WARRANTY' | 'PAID' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [action, setAction] = useState('COMMENT');
  const [extendedDeadline, setExtendedDeadline] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [childScope, setChildScope] = useState<string | null>(null);
  const key = useRef(crypto.randomUUID());
  const summary = useQuery({
    queryKey: ['maintenance', user, jobId, 'summary'],
    queryFn: () => financeApi.maintenance(jobId),
    enabled: completed,
    refetchInterval: 30000,
    retry: false,
  });
  const tickets = useQuery({
    queryKey: ['maintenance', user, jobId, 'tickets', page],
    queryFn: () => financeApi.tickets(jobId, page),
    enabled: completed && listOpen,
    refetchInterval: 30000,
  });
  const detail = useQuery({
    queryKey: ['maintenance', user, jobId, 'ticket', selected],
    queryFn: () => financeApi.ticket(selected!),
    enabled: Boolean(selected),
    refetchInterval: 30000,
  });
  const refresh = () =>
    Promise.all([
      cache.invalidateQueries({ queryKey: ['maintenance', user, jobId] }),
      cache.invalidateQueries({ queryKey: ['finance', user] }),
    ]);
  if (!completed) return null;
  if (summary.isPending)
    return (
      <div className="rounded-xl bg-white p-3 text-xs text-slate-400">
        Đang tải thông tin bảo trì…
      </div>
    );
  if (summary.isError)
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-500">
        Chưa tải được thông tin bảo trì.{' '}
        <button type="button" className="underline" onClick={() => void summary.refetch()}>
          Thử lại
        </button>
      </div>
    );
  const warranty = summary.data;
  const ticket = detail.data;
  const openCreate = (kind: 'WARRANTY' | 'PAID') => {
    setCreating(kind);
    setTitle('');
    setDescription('');
    setError('');
    key.current = crypto.randomUUID();
  };
  const choose = (item: MaintenanceTicket) => {
    setSelected(item.id);
    setListOpen(false);
    setAction('COMMENT');
    setContent('');
    setError('');
  };
  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const ticket = await financePost<MaintenanceTicket>(
        `/projects/${jobId}/maintenance-tickets`,
        { requestKey: key.current, kind: creating, title, description }
      );
      setCreating(null);
      setSelected(ticket.id);
      await refresh();
    } catch (cause) {
      setError(financeError(cause));
    } finally {
      setBusy(false);
    }
  };
  const update = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (action === 'ADMIN_EXTEND')
        await financePost(`/maintenance-tickets/${selected}/extend`, {
          resolutionDueAt: new Date(extendedDeadline).toISOString(),
          content,
        });
      else await financePost(`/maintenance-tickets/${selected}/actions`, { action, content });
      setContent('');
      setAction('COMMENT');
      await refresh();
    } catch (cause) {
      setError(financeError(cause));
    } finally {
      setBusy(false);
    }
  };
  const actions = [
    ['COMMENT', 'Trao đổi thêm'],
    ['ESCALATE', 'Đề nghị admin hỗ trợ'],
  ];
  if (viewerRole === 'freelancer')
    actions.push(['START', 'Tiếp nhận xử lý'], ['NEED_INFORMATION', 'Cần khách hàng bổ sung']);
  if (
    viewerRole === 'freelancer' &&
    ticket?.kind === 'WARRANTY' &&
    ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT'].includes(ticket.status)
  )
    actions.push(['SUBMIT_FIX', 'Gửi bản vá để kiểm tra']);
  if (viewerRole === 'client' && ticket?.status === 'FIX_SUBMITTED')
    actions.push(['ACCEPT_FIX', 'Xác nhận đã sửa'], ['REJECT_FIX', 'Lỗi vẫn còn']);
  if (viewerRole === 'client' && ticket?.status !== 'DISPUTED')
    actions.push(['WITHDRAW', 'Rút ticket']);
  if (viewerRole === 'admin')
    actions.push(
      ['ADMIN_RESOLVE', 'Kết luận đã giải quyết'],
      ['ADMIN_OUT_OF_SCOPE', 'Kết luận ngoài phạm vi'],
      ['ADMIN_EXTEND', 'Gia hạn có căn cứ / cho tiếp tục xử lý']
    );
  return (
    <div className="mb-3 shrink-0 rounded-2xl border border-blue-100 bg-white p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <ShieldCheck className="mt-1 shrink-0 text-blue-700" size={21} />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {warranty.maintenanceStatus === 'ACTIVE'
                ? 'Bảo trì sau nghiệm thu'
                : warranty.openIssueCount
                  ? 'Đang xử lý ticket bảo trì'
                  : 'Đã hết hạn bảo trì miễn phí'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Hạn mở ticket: {dateTime(warranty.warrantyEndsAt)} · Công nợ{' '}
              {warranty.payoutBlocked ? 'đang được giữ' : 'được xét khả dụng'}
              {warranty.sandbox ? ' · Dự án mô phỏng' : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={secondaryClass}
            onClick={() => {
              setListOpen(true);
              setPage(0);
            }}
          >
            Ticket bảo trì ({warranty.openIssueCount})
          </button>
          {warranty.canCreateWarrantyTicket && (
            <button type="button" className={primaryClass} onClick={() => openCreate('WARRANTY')}>
              <MessageSquareWarning size={16} className="mr-2" />
              Báo lỗi trong thời gian bảo trì
            </button>
          )}
          {warranty.canRequestPaidMaintenance && (
            <button type="button" className={primaryClass} onClick={() => openCreate('PAID')}>
              Yêu cầu bảo trì có phí
            </button>
          )}
        </div>
      </div>
      {listOpen && (
        <Modal title="Ticket & yêu cầu bảo trì" onClose={() => setListOpen(false)}>
          {tickets.isPending ? (
            <p>Đang tải…</p>
          ) : tickets.isError ? (
            <Notice error>
              Không tải được danh sách.{' '}
              <button type="button" onClick={() => void tickets.refetch()} className="underline">
                Thử lại
              </button>
            </Notice>
          ) : tickets.data?.length === 0 ? (
            <Notice>
              Chưa có ticket. Bạn có thể báo lỗi trong thời hạn bảo trì hiển thị ở dự án.
            </Notice>
          ) : (
            tickets.data?.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => choose(item)}
                className="block w-full rounded-xl border border-slate-200 p-4 text-left hover:border-blue-300"
              >
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.kind === 'PAID' ? 'Yêu cầu báo giá' : 'Bảo trì miễn phí'} ·{' '}
                  {statusLabel[item.status]} · {dateTime(item.createdAt)}
                </p>
              </button>
            ))
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={page === 0}
              className={secondaryClass}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </button>
            <button
              type="button"
              disabled={tickets.data?.length !== 25}
              className={secondaryClass}
              onClick={() => setPage((p) => p + 1)}
            >
              Tiếp
            </button>
          </div>
        </Modal>
      )}
      {creating && (
        <Modal
          title={
            creating === 'WARRANTY' ? 'Báo lỗi trong thời gian bảo trì' : 'Yêu cầu báo giá bảo trì'
          }
          onClose={() => setCreating(null)}
          busy={busy}
        >
          <form onSubmit={(e) => void create(e)} className="space-y-4">
            <Notice>
              {creating === 'WARRANTY'
                ? 'Mô tả lỗi thuộc sản phẩm đã nghiệm thu. Ticket gửi đúng hạn sẽ tiếp tục được xử lý miễn phí sau ngày thứ 7.'
                : 'Đây là yêu cầu báo giá, chưa phát sinh thanh toán. Hai bên cần thống nhất phạm vi, giá và thời hạn trước khi thực hiện.'}
            </Notice>
            <Field label="Tiêu đề">
              <input
                className={inputClass}
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field
              label="Chi tiết và bằng chứng"
              hint="Ghi bước tái hiện, kết quả mong đợi, kết quả thực tế và yêu cầu trong SRS liên quan. Không gửi mật khẩu hoặc khóa bí mật."
            >
              <textarea
                className={inputClass}
                required
                rows={7}
                maxLength={8000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            {error && <Notice error>{error}</Notice>}
            <button type="submit" disabled={busy} className={primaryClass}>
              {busy ? 'Đang gửi…' : 'Gửi yêu cầu'}
            </button>
          </form>
        </Modal>
      )}
      {selected && (
        <Modal
          title={ticket?.title || 'Chi tiết ticket'}
          onClose={() => {
            setSelected(null);
            setError('');
          }}
          busy={busy}
        >
          {detail.isPending ? (
            <p>Đang tải…</p>
          ) : detail.isError ? (
            <Notice error>Không tải được ticket.</Notice>
          ) : (
            ticket && (
              <>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                    {statusLabel[ticket.status]}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    {ticket.kind === 'PAID' ? 'Yêu cầu báo giá' : 'Bảo trì miễn phí'}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
                  {ticket.description}
                </p>
                {ticket.kind === 'PAID' && !ticket.closedAt && (
                  <QuotePanel
                    ticketId={ticket.id}
                    viewerRole={viewerRole}
                    onChanged={() => void refresh()}
                  />
                )}
                <p className="text-xs text-slate-500">
                  Hạn phản hồi: {dateTime(ticket.responseDueAt)}
                  <br />
                  Hạn xử lý: {dateTime(ticket.resolutionDueAt)}
                </p>
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  {ticket.events?.map((event) => (
                    <div key={event.id} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        {dateTime(event.createdAt)} · {event.action}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                        {event.content}
                      </p>
                    </div>
                  ))}
                </div>
                {!ticket.closedAt && (
                  <form
                    onSubmit={(e) => void update(e)}
                    className="space-y-3 border-t border-slate-100 pt-4"
                  >
                    <Field label="Thao tác">
                      <select
                        className={inputClass}
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                      >
                        {actions.map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {action === 'ADMIN_EXTEND' && (
                      <Field label="Hạn xử lý mới">
                        <input
                          type="datetime-local"
                          required
                          value={extendedDeadline}
                          onChange={(e) => setExtendedDeadline(e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                    )}
                    <Field label="Nội dung">
                      <textarea
                        className={inputClass}
                        required
                        rows={3}
                        maxLength={8000}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </Field>
                    {error && <Notice error>{error}</Notice>}
                    <button type="submit" disabled={busy} className={primaryClass}>
                      {busy ? 'Đang gửi…' : 'Gửi cập nhật'}
                    </button>
                  </form>
                )}
              </>
            )
          )}
        </Modal>
      )}
      {includePaid && (
        <PaidMaintenancePanel
          scopeId={jobId}
          viewerRole={viewerRole}
          onOpenWarranty={setChildScope}
        />
      )}
      {childScope && (
        <Modal title="Bảo trì của đơn dịch vụ" onClose={() => setChildScope(null)}>
          <MaintenancePanel
            jobId={childScope}
            completed
            viewerRole={viewerRole}
            includePaid={false}
          />
        </Modal>
      )}
    </div>
  );
}
