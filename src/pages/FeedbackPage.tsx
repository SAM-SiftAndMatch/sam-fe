import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareHeart } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { feedbackApi } from '../api/feedback';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import { AdminPagination } from '../components/admin/AdminUI';
import FeedbackStatusBadge from '../components/feedback/FeedbackStatusBadge';
import StarRating from '../components/feedback/StarRating';
import {
  Field,
  Notice,
  inputClass,
  primaryClass,
  secondaryClass,
} from '../components/finance/FinanceUI';
import { feedbackDate, feedbackError, feedbackValidation } from '../lib/feedback';
import { useAuthStore } from '../stores/useAuthStore';

export default function FeedbackPage() {
  const userId = useAuthStore((state) => state.user?.userId);
  const cache = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const requestKey = useRef(crypto.randomUUID());
  const history = useQuery({
    queryKey: ['platform-feedback', userId, page],
    queryFn: () => feedbackApi.mine(page),
    refetchOnWindowFocus: true,
  });
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const invalid = feedbackValidation(rating, comment);
    setError(invalid);
    if (invalid) return;
    setBusy(true);
    try {
      await feedbackApi.create({ rating, comment: comment.trim(), requestKey: requestKey.current });
      setRating(0);
      setComment('');
      setPage(0);
      requestKey.current = crypto.randomUUID();
      toast.success('Cảm ơn bạn! SAM đã nhận được đánh giá của bạn.');
      await cache
        .invalidateQueries({ queryKey: ['platform-feedback', userId] }, { throwOnError: true })
        .catch(() => {
          toast.warning('Đánh giá đã được gửi nhưng chưa tải lại được lịch sử. Hãy bấm Thử lại.');
        });
    } catch (cause) {
      const message = feedbackError(cause, 'Không gửi được đánh giá. Vui lòng thử lại.');
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-9 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <span className="mb-4 inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
            <MessageSquareHeart size={26} aria-hidden="true" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Đánh giá nền tảng SAM</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Chia sẻ trải nghiệm và những điều bạn muốn SAM cải thiện. Đánh giá của bạn chỉ hiển thị
            cho bạn và đội ngũ quản trị SAM.
          </p>
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[1fr_1.1fr]">
          <form
            onSubmit={(event) => void submit(event)}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <StarRating value={rating} onChange={setRating} disabled={busy} />
            <Field
              label="Nhận xét của bạn"
              hint="Không bắt buộc. Bạn có thể góp ý về giao diện, tính năng hoặc vấn đề khi sử dụng."
            >
              <textarea
                rows={6}
                maxLength={2000}
                disabled={busy}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className={inputClass}
                placeholder="Điều gì đang làm tốt? Bạn muốn cải thiện điều gì?"
              />
            </Field>
            <p className="text-right text-xs text-slate-400">{comment.length}/2000 ký tự</p>
            {error && <Notice error>{error}</Notice>}
            <button
              type="submit"
              disabled={busy || rating === 0}
              className={`${primaryClass} w-full`}
            >
              {busy ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
          <section className="space-y-4" aria-label="Đánh giá đã gửi">
            <h2 className="text-lg font-bold">Đánh giá của bạn</h2>
            {history.isPending && <p className="text-sm text-slate-500">Đang tải đánh giá...</p>}
            {history.isError && (
              <Notice error>
                Không tải được lịch sử đánh giá.{' '}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => void history.refetch()}
                >
                  Thử lại
                </button>
              </Notice>
            )}
            {!history.isError && history.data?.items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
                {page === 0
                  ? 'Bạn chưa gửi đánh giá nào. Góp ý đầu tiên của bạn sẽ giúp SAM tốt hơn.'
                  : 'Không có đánh giá ở trang này.'}
              </div>
            )}
            {!history.isError &&
              history.data?.items.map((item) => (
                <article
                  key={item.id}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <StarRating value={item.rating} />
                    <FeedbackStatusBadge status={item.status} />
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {item.comment || 'Bạn đã gửi đánh giá bằng số sao.'}
                  </p>
                  <p className="text-xs text-slate-400">Gửi lúc {feedbackDate(item.createdAt)}</p>
                </article>
              ))}
            {history.data && (
              <AdminPagination
                page={page}
                size={history.data.size}
                total={history.data.totalElements}
                onPage={setPage}
              />
            )}
            {history.isError && (
              <button type="button" className={secondaryClass} onClick={() => setPage(0)}>
                Về trang đầu
              </button>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
