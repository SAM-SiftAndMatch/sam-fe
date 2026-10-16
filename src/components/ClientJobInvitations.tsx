import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type JobInvitation, invitationsApi } from '../api/invitations';
import { PATH_CLIENT_FIND_FREELANCER, PATH_WORKSPACE } from '../routes/paths';
import PaginationNav from './PaginationNav';

const labels: Record<JobInvitation['status'], string> = {
  PENDING: 'Đang chờ phản hồi',
  ACCEPTED: 'Đã đồng ý trao đổi',
  DECLINED: 'Đã từ chối',
  WITHDRAWN: 'Đã thu hồi',
  EXPIRED: 'Đã hết hạn',
  SELECTED: 'Được chọn ký hợp đồng',
  NOT_SELECTED: 'Không được chọn',
};

export default function ClientJobInvitations({
  jobId,
  isOpen,
  onSelected,
}: {
  jobId: string;
  isOpen: boolean;
  onSelected: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [confirm, setConfirm] = useState<JobInvitation | null>(null);
  const [error, setError] = useState('');
  const invitations = useQuery({
    queryKey: ['job-invitations', jobId, page],
    queryFn: () => invitationsApi.jobPage(jobId, { page, size: 10 }),
  });
  const select = useMutation({
    mutationFn: (invitationId: string) => invitationsApi.select(jobId, invitationId),
    onSuccess: () => {
      setConfirm(null);
      void queryClient.invalidateQueries({ queryKey: ['job-invitations', jobId] });
      onSelected();
    },
    onError: (cause) =>
      setError(cause instanceof Error ? cause.message : 'Không chọn được freelancer.'),
  });
  const withdraw = useMutation({
    mutationFn: (invitationId: string) => invitationsApi.withdraw(invitationId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['job-invitations', jobId] }),
    onError: (cause) =>
      setError(cause instanceof Error ? cause.message : 'Không thu hồi được lời mời.'),
  });

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Ứng viên đã mời</h2>
          <p className="mt-1 text-sm text-gray-600">
            Đồng ý lời mời chỉ mở chat. Bạn chọn một người trước khi tạo hợp đồng.
          </p>
        </div>
        {isOpen && (
          <button
            type="button"
            onClick={() => navigate(`${PATH_CLIENT_FIND_FREELANCER}?jobId=${jobId}`)}
            className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Tìm freelancer
          </button>
        )}
      </div>
      {invitations.isLoading && <p className="mt-5 text-gray-600">Đang tải lời mời...</p>}
      {invitations.isError && (
        <p role="alert" className="mt-5 text-red-700">
          Không tải được lời mời.
        </p>
      )}
      {invitations.data?.items.length === 0 && (
        <p className="mt-5 text-gray-600">Chưa có ai được mời cho dự án này.</p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-red-700">
          {error}
        </p>
      )}
      <div className="mt-5 grid gap-3">
        {invitations.data?.items.map((invitation) => (
          <article
            key={invitation.id}
            className="rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div>
              <p className="font-semibold text-gray-900">{invitation.freelancerName}</p>
              <p className="mt-1 text-sm text-gray-600">{labels[invitation.status]}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {invitation.roomId && (
                <button
                  type="button"
                  onClick={() => navigate(PATH_WORKSPACE.replace(':projectId', invitation.roomId!))}
                  className="rounded-xl border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-800"
                >
                  Mở chat
                </button>
              )}
              {isOpen && invitation.status === 'PENDING' && (
                <button
                  type="button"
                  disabled={withdraw.isPending}
                  onClick={() => withdraw.mutate(invitation.id)}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
                >
                  Thu hồi
                </button>
              )}
              {isOpen && invitation.status === 'ACCEPTED' && (
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setConfirm(invitation);
                  }}
                  className="rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white"
                >
                  Chọn để ký hợp đồng
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      <PaginationNav
        page={page + 1}
        totalPages={invitations.data?.totalPages ?? 0}
        onPageChange={(next) => setPage(next - 1)}
        label="Phân trang lời mời"
        className="mt-5"
      />
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !select.isPending) setConfirm(null);
          }}
        >
          <dialog
            open
            aria-modal="true"
            aria-label="Xác nhận chọn freelancer"
            className="static m-0 w-full max-w-md rounded-2xl border-0 bg-white p-6 text-left shadow-xl"
          >
            <h3 className="text-xl font-bold text-gray-900">Chọn {confirm.freelancerName}?</h3>
            <p className="mt-3 text-gray-700">
              Dự án sẽ chuyển sang trao đổi hợp đồng với freelancer này. Các ứng viên khác sẽ không
              thể được chọn cho dự án hiện tại.
            </p>
            {error && (
              <p role="alert" className="mt-3 text-red-700">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={select.isPending}
                onClick={() => setConfirm(null)}
                className="rounded-xl border px-4 py-2"
              >
                Quay lại
              </button>
              <button
                type="button"
                disabled={select.isPending}
                onClick={() => select.mutate(confirm.id)}
                className="rounded-xl bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
              >
                {select.isPending ? 'Đang chọn...' : 'Xác nhận chọn'}
              </button>
            </div>
          </dialog>
        </div>
      )}
    </section>
  );
}
