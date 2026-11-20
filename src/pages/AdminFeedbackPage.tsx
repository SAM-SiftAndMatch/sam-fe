import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Filter, MessageSquare, RefreshCw, Star } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { type AdminFeedback, type FeedbackStatus, feedbackApi } from '../api/feedback';
import {
  AdminCard,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminPagination,
  adminInput,
} from '../components/admin/AdminUI';
import FeedbackStatusBadge from '../components/feedback/FeedbackStatusBadge';
import StarRating from '../components/feedback/StarRating';
import {
  Field,
  Modal,
  Notice,
  inputClass,
  primaryClass,
  secondaryClass,
} from '../components/finance/FinanceUI';
import {
  feedbackDate,
  feedbackError,
  feedbackFilters,
  feedbackRoleLabels,
  feedbackStatusLabels,
} from '../lib/feedback';
import { useAuthStore } from '../stores/useAuthStore';

export function FeedbackEditor({
  item,
  onSaved,
  onReload,
  onBusy,
}: {
  item: AdminFeedback;
  onSaved: () => void;
  onReload: () => void;
  onBusy: (busy: boolean) => void;
}) {
  const cache = useQueryClient();
  const [status, setStatus] = useState<FeedbackStatus>(item.status);
  const [note, setNote] = useState(item.adminNote);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    onBusy(true);
    setError('');
    setConflict(false);
    try {
      await feedbackApi.update(item.id, { status, adminNote: note.trim(), version: item.version });
      toast.success('Đã cập nhật trạng thái và ghi chú đánh giá.');
      onSaved();
      await cache
        .invalidateQueries({ queryKey: ['admin-feedback'] }, { throwOnError: true })
        .catch(() => {
          toast.warning(
            'Đã lưu cập nhật nhưng chưa tải lại được danh sách. Vui lòng làm mới trang.'
          );
        });
    } catch (cause) {
      const message = feedbackError(cause, 'Không lưu được cập nhật. Vui lòng thử lại.');
      setError(message);
      setConflict(isAxiosError(cause) && cause.response?.status === 409);
      toast.error(message);
    } finally {
      setBusy(false);
      onBusy(false);
    }
  };
  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-5">
      <div className="space-y-2">
        <p className="font-semibold text-slate-900">{item.userName}</p>
        <p className="break-all text-sm text-slate-500">
          {item.userEmail} · {feedbackRoleLabels[item.userRole]}
        </p>
        <StarRating value={item.rating} />
        <p className="text-xs text-slate-400">{feedbackDate(item.createdAt)}</p>
      </div>
      <div className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {item.comment || 'Người dùng chỉ gửi đánh giá bằng số sao.'}
      </div>
      <Field label="Trạng thái xử lý">
        <select
          className={inputClass}
          value={status}
          disabled={busy}
          onChange={(event) => setStatus(event.target.value as FeedbackStatus)}
        >
          {Object.entries(feedbackStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Ghi chú nội bộ" hint="Chỉ admin xem được. Người gửi chỉ thấy trạng thái xử lý.">
        <textarea
          rows={4}
          maxLength={2000}
          className={inputClass}
          value={note}
          disabled={busy}
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>
      {item.reviewedByName && (
        <p className="text-xs text-slate-400">
          Cập nhật gần nhất bởi {item.reviewedByName} · {feedbackDate(item.updatedAt)}
        </p>
      )}
      {error && <Notice error>{error}</Notice>}
      <div className="flex flex-wrap justify-end gap-2">
        {conflict && (
          <button type="button" disabled={busy} onClick={onReload} className={secondaryClass}>
            Tải bản mới
          </button>
        )}
        <button type="submit" disabled={busy || conflict} className={primaryClass}>
          {busy ? 'Đang lưu...' : 'Lưu cập nhật'}
        </button>
      </div>
    </form>
  );
}

function FeedbackDetail({
  id,
  owner,
  onClose,
}: { id: string; owner?: string; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const detail = useQuery({
    queryKey: ['admin-feedback', owner, 'detail', id],
    queryFn: () => feedbackApi.detail(id),
  });
  return (
    <Modal
      title="Chi tiết đánh giá nền tảng"
      busy={busy}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      {detail.isPending || detail.isFetching ? (
        <p>Đang tải đánh giá...</p>
      ) : detail.isError ? (
        <AdminError error={detail.error} retry={() => void detail.refetch()} />
      ) : (
        <FeedbackEditor
          key={`${detail.data.id}:${detail.data.version}`}
          item={detail.data}
          onSaved={onClose}
          onReload={() => void detail.refetch()}
          onBusy={setBusy}
        />
      )}
    </Modal>
  );
}

export default function AdminFeedbackPage() {
  const owner = useAuthStore((state) => state.user?.userId);
  const [params, setParams] = useSearchParams();
  const filters = feedbackFilters(params);
  const page = Number(filters.get('page'));
  const [selected, setSelected] = useState<string | null>(null);
  const list = useQuery({
    queryKey: ['admin-feedback', owner, 'list', filters.toString()],
    queryFn: () => feedbackApi.adminList(filters),
    refetchOnWindowFocus: true,
  });
  const summary = useQuery({
    queryKey: ['admin-feedback', owner, 'summary'],
    queryFn: feedbackApi.summary,
    refetchOnWindowFocus: true,
  });
  const apply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    for (const key of ['q', 'rating', 'status']) {
      const value = String(data.get(key) || '').trim();
      if (value) next.set(key, value);
    }
    setParams(next);
  };
  const totals = summary.data;
  const cards = [
    {
      label: 'Điểm trung bình',
      value: totals?.total ? `${totals.averageRating.toFixed(1)}/5` : '—',
    },
    { label: 'Tổng đánh giá', value: totals?.total ?? '—' },
    { label: 'Mới tiếp nhận', value: totals?.newCount ?? '—' },
    { label: 'Đang xem xét', value: totals?.inProgressCount ?? '—' },
    { label: 'Đã xử lý', value: totals?.resolvedCount ?? '—' },
  ];
  return (
    <div>
      <AdminPageHeader
        title="Đánh giá & góp ý"
        description="Theo dõi trải nghiệm người dùng, tiếp nhận góp ý và ghi nhận quá trình xử lý."
        action={
          <button
            type="button"
            disabled={list.isFetching || summary.isFetching}
            className={secondaryClass}
            onClick={() => {
              void list.refetch();
              void summary.refetch();
            }}
          >
            <RefreshCw size={15} /> Làm mới
          </button>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
      {summary.isError && (
        <div className="mb-5">
          <AdminError error={summary.error} retry={() => void summary.refetch()} />
        </div>
      )}
      {totals && (
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">
            Phân bố số sao · toàn bộ đánh giá
          </h2>
          <div className="grid gap-3 sm:grid-cols-5">
            {[...totals.ratings].reverse().map((item) => (
              <div key={item.rating} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    {item.rating}{' '}
                    <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                  </span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${totals.total ? (item.count / totals.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <form
        key={params.toString()}
        onSubmit={apply}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <label className="min-w-48 flex-1 space-y-2 text-xs text-slate-500">
          Tìm kiếm
          <input
            name="q"
            maxLength={100}
            defaultValue={filters.get('q') ?? ''}
            placeholder="Tên, email hoặc nội dung góp ý..."
            className={`${adminInput} block w-full`}
          />
        </label>
        <label className="space-y-2 text-xs text-slate-500">
          Số sao
          <select
            name="rating"
            defaultValue={filters.get('rating') ?? ''}
            className={`${adminInput} block`}
          >
            <option value="">Tất cả số sao</option>
            {[5, 4, 3, 2, 1].map((star) => (
              <option key={star} value={star}>
                {star} sao
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-xs text-slate-500">
          Trạng thái
          <select
            name="status"
            defaultValue={filters.get('status') ?? ''}
            className={`${adminInput} block`}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(feedbackStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={primaryClass}>
          <Filter size={14} /> Lọc đánh giá
        </button>
        <button
          type="button"
          className={secondaryClass}
          onClick={() => setParams(new URLSearchParams())}
        >
          Xóa bộ lọc
        </button>
      </form>
      {list.isPending ? (
        <AdminLoading />
      ) : list.isError ? (
        <AdminError error={list.error} retry={() => void list.refetch()} />
      ) : (
        <AdminCard
          title="Danh sách đánh giá"
          action={<span className="text-xs text-slate-400">{list.data.totalElements} kết quả</span>}
        >
          {list.data.items.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-slate-500">
              <MessageSquare size={30} className="mx-auto mb-3 text-slate-300" />
              Chưa có đánh giá phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {list.data.items.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-4 p-5"
                >
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-slate-900">{item.userName}</p>
                      <FeedbackStatusBadge status={item.status} />
                    </div>
                    <p className="break-all text-xs text-slate-500">
                      {item.userEmail} · {feedbackRoleLabels[item.userRole]}
                    </p>
                    <StarRating value={item.rating} />
                    <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                      {item.comment || 'Đánh giá bằng số sao.'}
                    </p>
                    <p className="text-xs text-slate-400">{feedbackDate(item.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(item.id)}
                    className={secondaryClass}
                  >
                    Xem và xử lý
                  </button>
                </article>
              ))}
            </div>
          )}
          <AdminPagination
            page={page}
            size={list.data.size}
            total={list.data.totalElements}
            onPage={(next) => {
              const updated = new URLSearchParams(params);
              updated.set('page', String(next));
              setParams(updated);
            }}
          />
        </AdminCard>
      )}
      {selected && <FeedbackDetail id={selected} owner={owner} onClose={() => setSelected(null)} />}
    </div>
  );
}
