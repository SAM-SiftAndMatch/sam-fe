import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectDraftApi } from '../api/projectDrafts';
import AppHeader from '../components/AppHeader';
import PaginationNav from '../components/PaginationNav';
import { usePageSearchParam } from '../hooks/usePageSearchParam';
import { useAuthStore } from '../stores/useAuthStore';
import type { ProjectDraftSummary } from '../types/projectDraft';
import { formatDate } from '../utils/format';
import { projectDraftHref } from '../utils/projectDraft';

export default function ClientDraftsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.userId);
  const [page, setPage] = usePageSearchParam();
  const [toDelete, setToDelete] = useState<ProjectDraftSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drafts = useQuery({
    queryKey: ['project-drafts', 'page', userId, page, 10],
    queryFn: () => projectDraftApi.page(page, 10),
    enabled: Boolean(userId),
    refetchOnMount: 'always',
  });

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await projectDraftApi.remove(toDelete.id);
      setToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ['project-drafts'] });
      if (page > 0 && drafts.data?.items.length === 1) setPage(page - 1);
    } catch {
      setError('Không xóa được bản nháp. Vui lòng thử lại.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="client-route min-h-screen bg-[#F8FAFC]">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Các yêu cầu nháp</h1>
        <p className="mb-7 text-sm text-gray-600">
          Tiếp tục làm rõ hoặc hoàn tất dự án bạn đang chuẩn bị.
        </p>
        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}
        {drafts.isLoading && <p className="text-gray-600">Đang tải bản nháp...</p>}
        {drafts.isError && (
          <p role="alert" className="text-red-700">
            Không tải được danh sách bản nháp.
          </p>
        )}
        {drafts.data?.items.length === 0 && (
          <p className="rounded-xl border border-gray-200 bg-white p-8 text-gray-600">
            Bạn chưa có yêu cầu nháp nào.
          </p>
        )}
        <div className="grid gap-3">
          {drafts.data?.items.map((draft) => (
            <article
              key={draft.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-gray-900">
                    {draft.title?.trim() || draft.brief?.slice(0, 100) || 'Yêu cầu chưa đặt tên'}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {draft.flowType === 'AI' ? 'AI Brief' : 'Đăng thủ công'} · Cập nhật{' '}
                    {formatDate(draft.updatedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(projectDraftHref(draft))}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Tiếp tục
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(draft)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <PaginationNav
          page={page + 1}
          totalPages={drafts.data?.totalPages ?? 0}
          onPageChange={(next) => setPage(next - 1)}
          label="Phân trang bản nháp"
          className="mt-6"
        />
      </main>
      {toDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setToDelete(null);
          }}
        >
          <dialog
            open
            aria-label="Xác nhận xóa bản nháp"
            className="relative m-0 w-full max-w-md rounded-2xl border-0 bg-white p-6 text-gray-900 shadow-xl"
          >
            <h2 className="text-lg font-bold">Xóa bản nháp này?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Bản nháp và lịch sử chat AI của dự án sẽ không còn xuất hiện trong danh sách.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setToDelete(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
              >
                Giữ lại
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void remove()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleting ? 'Đang xóa...' : 'Xóa bản nháp'}
              </button>
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}
