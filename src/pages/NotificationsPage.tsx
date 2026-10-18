import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { type UserNotification, notificationsApi } from '../api/notifications';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import PaginationNav from '../components/PaginationNav';
import { usePageSearchParam } from '../hooks/usePageSearchParam';
import {
  PATH_CLIENT_PROJECT_DETAIL,
  PATH_FREELANCER_INVITATIONS,
  PATH_JOB_DETAIL,
  PATH_WORKSPACE,
} from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

const notificationTitles: Record<string, string> = {
  CHAT_MESSAGE: 'Tin nhắn mới',
  JOB_INVITE: 'Lời mời làm việc mới',
  JOB_INVITE_ACCEPTED: 'Freelancer đã đồng ý lời mời',
  JOB_INVITE_DECLINED: 'Freelancer đã từ chối lời mời',
  JOB_INVITE_WITHDRAWN: 'Lời mời đã được thu hồi',
  JOB_INVITE_SELECTED: 'Bạn được chọn cho dự án',
  JOB_INVITE_NOT_SELECTED: 'Dự án đã chọn freelancer khác',
  PROPOSAL_RECEIVED: 'Có hồ sơ ứng tuyển mới',
  PROPOSAL_INVITE: 'Lời mời hợp tác mới',
  PROPOSAL_ACCEPTED: 'Lời mời hợp tác đã được chấp nhận',
  PROPOSAL_REJECTED: 'Hồ sơ ứng tuyển đã bị từ chối',
  PROJECT_ADDON_PAYMENT_PENDING: 'Chưa thanh toán tính năng dự án',
  PROJECT_ADDON_PAYMENT_PAID: 'Đã kích hoạt tính năng dự án',
  PROJECT_ADDON_PAYMENT_REVIEW: 'Thanh toán tính năng cần hỗ trợ',
};

const titleFor = (type: string) => notificationTitles[type] ?? 'Cập nhật mới';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = usePageSearchParam();
  const notifications = useQuery({
    queryKey: ['user-notifications', 'page', user?.userId, page],
    queryFn: () => notificationsApi.page({ page, size: 10 }),
    enabled: Boolean(user?.userId),
  });

  const open = async (notification: UserNotification) => {
    if (notification.readAt == null) {
      await notificationsApi.markRead(notification.id);
      await queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    }
    if (notification.roomId) {
      navigate(PATH_WORKSPACE.replace(':projectId', notification.roomId));
    } else if (user?.role === 'FREELANCER' && notification.type.startsWith('JOB_INVITE')) {
      navigate(PATH_FREELANCER_INVITATIONS);
    } else if (notification.jobId) {
      navigate(
        user?.role === 'CLIENT' && notification.type !== '1_TOUCH_INVITE'
          ? PATH_CLIENT_PROJECT_DETAIL.replace(':id', notification.jobId)
          : PATH_JOB_DETAIL.replace(':id', notification.jobId)
      );
    }
  };

  return (
    <div className="notifications-page min-h-screen bg-[#F8FAFC] flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Tất cả thông báo</h1>
        <p className="mt-2 mb-7 text-gray-600">
          Lịch sử cập nhật và tin nhắn theo từng cuộc trò chuyện.
        </p>
        {notifications.isLoading && <p className="text-gray-600">Đang tải thông báo...</p>}
        {notifications.isError && (
          <p role="alert" className="text-red-700">
            Không tải được thông báo.
          </p>
        )}
        {notifications.data?.items.length === 0 && (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-600">
            Bạn chưa có thông báo nào.
          </p>
        )}
        <div className="grid gap-3">
          {notifications.data?.items.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => void open(notification)}
              className={`notification-page-item w-full rounded-2xl border p-5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40 ${notification.readAt ? 'border-gray-200 bg-white' : 'notification-page-item--unread border-blue-200 bg-blue-50/50'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-gray-900">{titleFor(notification.type)}</h2>
                  <p className="mt-1 text-sm text-gray-700">
                    {notification.type === 'CHAT_MESSAGE'
                      ? `${notification.actorName || 'Người dùng'} đã gửi ${notification.unreadCount} tin nhắn mới${notification.jobTitle ? ` trong dự án “${notification.jobTitle}”` : ''}.`
                      : `${notification.actorName ? `${notification.actorName} · ` : ''}${notification.message || notification.jobTitle || 'Có cập nhật mới.'}`}
                  </p>
                </div>
                {!notification.readAt && !notification.resolvedAt && (
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600"
                    aria-label="Chưa đọc"
                  />
                )}
              </div>
              <time className="mt-3 block text-xs text-gray-500" dateTime={notification.createdAt}>
                {new Date(notification.createdAt).toLocaleString('vi-VN')}
              </time>
            </button>
          ))}
        </div>
        <PaginationNav
          page={page + 1}
          totalPages={notifications.data?.totalPages ?? 0}
          onPageChange={(nextPage) => setPage(nextPage - 1)}
          label="Phân trang thông báo"
          className="mt-6"
        />
      </main>
      <Footer />
    </div>
  );
}
