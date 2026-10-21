import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type InvitationStatus, invitationsApi } from '../api/invitations';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import PaginationNav from '../components/PaginationNav';
import { usePageSearchParam } from '../hooks/usePageSearchParam';
import { PATH_WORKSPACE } from '../routes/paths';

const statusText: Record<InvitationStatus, string> = {
  PENDING: 'Đang chờ phản hồi',
  ACCEPTED: 'Đã đồng ý',
  DECLINED: 'Đã từ chối',
  WITHDRAWN: 'Khách hàng đã thu hồi',
  EXPIRED: 'Đã hết hạn',
  SELECTED: 'Được chọn',
  NOT_SELECTED: 'Dự án đã chọn người khác',
};

const FreelancerInvitationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = usePageSearchParam();
  const [status, setStatus] = useState<InvitationStatus | ''>('');
  const [feedback, setFeedback] = useState('');
  const invitations = useQuery({
    queryKey: ['my-job-invitations', page, status],
    queryFn: () => invitationsApi.mine({ page, size: 10, status: status || undefined }),
  });
  const respond = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'decline' }) =>
      action === 'accept' ? invitationsApi.accept(id) : invitationsApi.decline(id),
    onSuccess: (invitation, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['my-job-invitations'] });
      void queryClient.invalidateQueries({ queryKey: ['job-invitations', invitation.jobId] });
      if (variables.action === 'accept' && invitation.roomId) {
        navigate(PATH_WORKSPACE.replace(':projectId', invitation.roomId));
      } else {
        setFeedback('Đã cập nhật lời mời.');
      }
    },
  });

  return (
    <div className="freelancer-route min-h-screen bg-[#F8FAFC] flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lời mời làm việc</h1>
            <p className="mt-2 text-gray-600">
              Các lời mời được lưu ở đây kể cả khi bạn bỏ lỡ thông báo.
            </p>
          </div>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as InvitationStatus | '');
              setPage(0);
            }}
            aria-label="Lọc lời mời"
            className="cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusText).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {feedback && (
          <output
            aria-live="polite"
            className="mb-5 block rounded-xl bg-green-50 border border-green-200 p-3 text-green-800"
          >
            {feedback}
          </output>
        )}
        {invitations.isLoading && <p className="text-gray-600">Đang tải lời mời...</p>}
        {invitations.isError && (
          <p role="alert" className="text-red-700">
            Không tải được lời mời. Vui lòng thử lại.
          </p>
        )}
        {invitations.data?.items.length === 0 && (
          <p className="rounded-2xl bg-white border p-8 text-gray-600">Chưa có lời mời nào.</p>
        )}
        <div className="grid gap-4">
          {invitations.data?.items.map((invitation) => (
            <article
              key={invitation.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{invitation.jobTitle}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Gửi ngày {new Date(invitation.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span className="self-start rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                  {statusText[invitation.status]}
                </span>
              </div>
              {invitation.message && (
                <p className="mt-4 whitespace-pre-wrap text-gray-700">{invitation.message}</p>
              )}
              {invitation.status === 'PENDING' && (
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    disabled={respond.isPending}
                    onClick={() => respond.mutate({ id: invitation.id, action: 'accept' })}
                    className="cursor-pointer rounded-xl bg-blue-700 px-4 py-2 text-white font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Đồng ý, mở phòng chat
                  </button>
                  <button
                    type="button"
                    disabled={respond.isPending}
                    onClick={() => respond.mutate({ id: invitation.id, action: 'decline' })}
                    className="cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-gray-800 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Từ chối
                  </button>
                </div>
              )}
              {invitation.roomId && (
                <button
                  type="button"
                  onClick={() => navigate(PATH_WORKSPACE.replace(':projectId', invitation.roomId!))}
                  className="mt-5 cursor-pointer rounded-xl border border-blue-300 px-4 py-2 text-blue-800 font-semibold"
                >
                  Mở phòng chat
                </button>
              )}
            </article>
          ))}
        </div>
        {respond.isError && (
          <p role="alert" className="mt-5 text-red-700">
            {respond.error instanceof Error
              ? respond.error.message
              : 'Không cập nhật được lời mời.'}
          </p>
        )}
        <PaginationNav
          page={page + 1}
          totalPages={invitations.data?.totalPages ?? 0}
          onPageChange={(next) => setPage(next - 1)}
          label="Phân trang lời mời"
          className="mt-6"
        />
      </main>
      <Footer />
    </div>
  );
};

export default FreelancerInvitationsPage;
