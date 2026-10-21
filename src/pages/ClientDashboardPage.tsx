import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../api/job';
import { type UserNotification, notificationsApi } from '../api/notifications';
import { profileApi } from '../api/profile';
import { projectDraftApi } from '../api/projectDrafts';
import { subscriptionApi } from '../api/subscription';
import AppHeader from '../components/AppHeader';
import FooterDashboard from '../components/FooterDashboard';
import JobStatusBadge from '../components/JobStatusBadge';
import InteractiveBackground from '../components/landing/InteractiveBackground';
import { PrimaryButton } from '../components/landing/LandingButtons';
import { PACKAGE_BUSINESS_ID } from '../features/subscription';
import {
  PATH_CLIENT_AI_BRIEF,
  PATH_CLIENT_DRAFTS,
  PATH_CLIENT_PRICING,
  PATH_CLIENT_PROFILE,
  PATH_CLIENT_PROJECTS,
  PATH_CLIENT_PROJECT_DETAIL,
  PATH_NOTIFICATIONS,
  PATH_WORKSPACE,
} from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';
import type { ClientDashboardOverview } from '../types/job';
import { formatDate, formatMoney } from '../utils/format';
import { projectDraftHref } from '../utils/projectDraft';

const stats: {
  label: string;
  description: string;
  key?: keyof Pick<ClientDashboardOverview, 'totalPosted' | 'inProgress' | 'completed'>;
  color: string;
  background: string;
  icon: string;
}[] = [
  {
    label: 'Tổng quan',
    description: 'Đã đăng',
    key: 'totalPosted',
    color: 'text-[#1D4ED8]',
    background: 'bg-[#EEF2FF]',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    label: 'Tiến độ',
    description: 'Đang thực hiện',
    key: 'inProgress',
    color: 'text-[#0AAAD7]',
    background: 'bg-[#E0F7FA]',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: 'Thành công',
    description: 'Hoàn thành',
    key: 'completed',
    color: 'text-emerald-500',
    background: 'bg-emerald-50',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: 'Lưu trữ',
    description: 'Bản nháp',
    color: 'text-gray-400',
    background: 'bg-gray-100',
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  },
];

const suggestions = [
  'Phát triển Website',
  'Nhập liệu',
  'Trợ lý ảo',
  'Soạn thảo văn bản',
  'AI Engineer',
];

function budgetLabel(min: number | null, max: number | null) {
  if (min == null) return max == null ? 'Thương lượng' : `Tối đa ${formatMoney(max)} đ`;
  if (max == null) return `Từ ${formatMoney(min)} đ`;
  return min === max ? `${formatMoney(min)} đ` : `${formatMoney(min)} – ${formatMoney(max)} đ`;
}

export default function ClientDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');

  const profile = useQuery({
    queryKey: ['client-profile', user?.userId],
    queryFn: profileApi.getClientProfile,
    enabled: Boolean(user?.userId),
    staleTime: 60_000,
    refetchOnMount: 'always',
  });
  const overview = useQuery({
    queryKey: ['client-dashboard-overview', user?.userId],
    queryFn: jobApi.getClientDashboardOverview,
    enabled: Boolean(user?.userId),
    staleTime: 30_000,
    refetchOnMount: 'always',
  });
  const draftList = useQuery({
    queryKey: ['project-drafts', 'page', user?.userId, 0, 3],
    queryFn: () => projectDraftApi.page(0, 3),
    enabled: Boolean(user?.userId),
    staleTime: 10_000,
    refetchOnMount: 'always',
  });
  const notifications = useQuery({
    queryKey: ['user-notifications', 'recent', user?.userId],
    queryFn: notificationsApi.recent,
    enabled: Boolean(user?.userId),
    staleTime: 15_000,
  });
  const subscriptions = useQuery({
    queryKey: ['subscriptions', 'me', user?.userId],
    queryFn: subscriptionApi.mySubscriptions,
    enabled: Boolean(user?.userId),
    staleTime: 60_000,
    refetchOnMount: 'always',
  });

  const businessActive = subscriptions.data?.some(
    (item) =>
      item.packageId === PACKAGE_BUSINESS_ID &&
      item.status === 'ACTIVE' &&
      (!item.endDate || new Date(item.endDate).getTime() > Date.now())
  );

  const startBrief = (suggestion?: string) => {
    const description = (suggestion ?? searchQuery).trim();
    if (description) navigate(PATH_CLIENT_AI_BRIEF, { state: { initialQuery: description } });
  };

  const openNotification = (notification: UserNotification) => {
    if (!notification.readAt) {
      void notificationsApi
        .markRead(notification.id)
        .then(() => queryClient.invalidateQueries({ queryKey: ['user-notifications'] }))
        .catch(() => undefined);
    }
    if (notification.roomId) {
      navigate(PATH_WORKSPACE.replace(':projectId', notification.roomId));
    } else if (notification.jobId) {
      navigate(PATH_CLIENT_PROJECT_DETAIL.replace(':id', notification.jobId));
    } else {
      navigate(PATH_NOTIFICATIONS);
    }
  };

  return (
    <div className="client-route relative flex min-h-screen flex-col bg-[#F8FAFC] font-sans selection:bg-[#1D4ED8]/10 selection:text-[#1D4ED8]">
      <InteractiveBackground />
      <AppHeader />

      <main className="client-dashboard-page relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
        {profile.isSuccess && !profile.data.companyName?.trim() && (
          <section className="dashboard-profile-warning rounded-[12px] border border-amber-200/80 bg-amber-50/90 p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)] md:p-8">
            <h2 className="mb-1 text-lg font-bold text-gray-900">
              Hồ sơ công ty của bạn chưa hoàn thiện
            </h2>
            <p className="mx-auto mb-5 max-w-md text-xs text-gray-600">
              Hãy cập nhật tên công ty để tạo uy tín với Freelancer trước khi đăng dự án tuyển dụng.
            </p>
            <PrimaryButton onClick={() => navigate(PATH_CLIENT_PROFILE)} size="sm">
              Hoàn thiện hồ sơ công ty
            </PrimaryButton>
          </section>
        )}

        <section className="relative flex w-full flex-col items-center overflow-hidden py-6 text-center md:py-10">
          <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[58rem] -translate-x-1/2 rounded-full bg-[#1D4ED8]/[0.06] blur-3xl" />
          <h1 className="relative z-10 mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Chào mừng trở lại,
            <br />
            <span className="text-[#1D4ED8]">
              {profile.data?.fullName || user?.fullName || 'bạn'}
            </span>
          </h1>
          <p className="relative z-10 mb-8 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
            Bắt đầu dự án mới hoặc quản lý các công việc đang diễn ra một cách thông minh và hiệu
            quả hơn với SAM AI
          </p>
          <div className="dashboard-search relative z-10 mb-5 flex w-full max-w-3xl flex-col items-stretch gap-2 rounded-[12px] border border-slate-200/90 bg-white p-2 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:gap-0">
            <input
              type="text"
              aria-label="Mô tả sơ bộ dự án"
              placeholder="Bạn muốn thực hiện dự án gì?"
              className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-0"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') startBrief();
              }}
            />
            <PrimaryButton onClick={() => startBrief()} className="shrink-0" withArrow={false}>
              Tiếp tục
            </PrimaryButton>
          </div>
          <div className="relative z-10 mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Gợi ý nhanh
            </span>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => startBrief(suggestion)}
                className="client-dashboard-suggestion rounded-[6px] border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors active:scale-[0.97]"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </section>

        <section
          className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          aria-label="Tổng quan dự án"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="dashboard-surface-card dashboard-stat-card relative flex flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_2px_15px_rgb(0,0,0,0.02)] md:p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.background} ${stat.color}`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                </div>
                <span className="text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {stat.label}
                </span>
              </div>
              <div className="mt-auto">
                <div className="mb-1 text-3xl font-extrabold leading-none text-gray-900">
                  {stat.key
                    ? overview.isLoading
                      ? '…'
                      : (overview.data?.[stat.key] ?? '—')
                    : draftList.isLoading
                      ? '…'
                      : (draftList.data?.totalElements ?? '—')}
                </div>
                <div className="text-xs font-semibold text-gray-500">{stat.description}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="dashboard-primary-panel dashboard-premium-panel relative flex w-full flex-col items-center justify-between gap-8 overflow-hidden rounded-[32px] bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] p-8 shadow-[0_8px_30px_rgba(29,78,216,0.2)] md:flex-row md:p-10">
          <div className="relative z-10 flex w-full flex-col items-start md:w-2/3">
            <span className="mb-4 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              {businessActive ? 'Đang sử dụng' : 'Premium'}
            </span>
            <h2 className="mb-3 text-2xl font-bold text-white">
              {businessActive
                ? 'Gói BUSINESS đang hoạt động'
                : 'Gói tháng: dùng thả ga, khỏi mua lẻ'}
            </h2>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-white/80">
              BUSINESS 249k/tháng: Nổi bật + Gợi ý freelancer cho mọi dự án. Checklist hỗ trợ nghiệm
              thu vẫn có sẵn cho mọi dự án.
            </p>
            <button
              type="button"
              onClick={() => navigate(PATH_CLIENT_PRICING)}
              className="dashboard-premium-cta cursor-pointer rounded-full border-0 bg-white px-8 py-3 text-sm font-bold text-[#1D4ED8] shadow-md transition-colors hover:bg-gray-50"
            >
              {businessActive ? 'Xem gói của tôi' : 'Xem gói BUSINESS'}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-10">
            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="dashboard-section-title text-xl font-bold text-gray-900">
                  Các yêu cầu nháp
                </h2>
                <button
                  type="button"
                  onClick={() => navigate(PATH_CLIENT_DRAFTS)}
                  className="cursor-pointer border-0 bg-transparent text-xs font-bold text-[#1D4ED8] hover:underline"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="dashboard-surface-card overflow-hidden rounded-3xl border border-gray-100 bg-white text-sm text-gray-600 shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
                {draftList.isLoading && <p className="p-6">Đang tải bản nháp...</p>}
                {draftList.isError && <p className="p-6 text-red-700">Không tải được bản nháp.</p>}
                {draftList.data?.items.length === 0 && (
                  <p className="p-6">Bạn chưa có yêu cầu nháp nào.</p>
                )}
                {draftList.data?.items.map((draft) => (
                  <button
                    key={draft.id}
                    type="button"
                    onClick={() => navigate(projectDraftHref(draft))}
                    className="dashboard-history-row flex w-full cursor-pointer items-center justify-between gap-4 border-b border-gray-100 p-5 text-left last:border-0 hover:bg-gray-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-gray-900">
                        {draft.title?.trim() || draft.brief?.slice(0, 80) || 'Yêu cầu chưa đặt tên'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {draft.flowType === 'AI' ? 'AI Brief' : 'Đăng thủ công'} · Cập nhật{' '}
                        {formatDate(draft.updatedAt)}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-bold text-[#1D4ED8]">Tiếp tục</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="dashboard-section-title text-xl font-bold text-gray-900">
                  Dự án gần đây
                </h2>
                <button
                  type="button"
                  onClick={() => navigate(PATH_CLIENT_PROJECTS)}
                  className="cursor-pointer border-0 bg-transparent text-xs font-bold text-[#1D4ED8] hover:underline"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="dashboard-surface-card flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
                {overview.isLoading && (
                  <p className="p-6 text-sm text-gray-500">Đang tải dự án gần đây...</p>
                )}
                {overview.isError && (
                  <p className="p-6 text-sm text-red-700">Không tải được dự án gần đây.</p>
                )}
                {overview.data?.recentProjects.length === 0 && (
                  <p className="p-6 text-sm text-gray-500">Bạn chưa đăng dự án nào.</p>
                )}
                {overview.data?.recentProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => navigate(PATH_CLIENT_PROJECT_DETAIL.replace(':id', project.id))}
                    className="dashboard-history-row flex w-full cursor-pointer items-center justify-between gap-4 border-b border-gray-100 p-5 text-left transition-colors last:border-0 hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-gray-900">{project.title}</h3>
                      <span className="text-[11px] font-medium text-gray-500">
                        Cập nhật {formatDate(project.updatedAt)}
                        {project.freelancerName ? ` · Freelancer: ${project.freelancerName}` : ''}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
                      <span className="text-xs font-semibold text-gray-700">
                        Ngân sách: {budgetLabel(project.budgetMin, project.budgetMax)}
                      </span>
                      <JobStatusBadge status={project.status} className="text-[10px]" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <section className="dashboard-surface-card rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="dashboard-section-title text-lg font-bold text-gray-900">
                  Thông báo
                </h2>
                {(notifications.data?.unreadCount ?? 0) > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {(notifications.data?.unreadCount ?? 0) > 99
                      ? '99+'
                      : notifications.data?.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {notifications.isLoading && (
                  <p className="text-xs text-gray-500">Đang tải thông báo...</p>
                )}
                {notifications.isError && (
                  <p className="text-xs text-red-700">Không tải được thông báo.</p>
                )}
                {notifications.data?.items.length === 0 && (
                  <p className="text-xs text-gray-500">Bạn chưa có thông báo nào.</p>
                )}
                {notifications.data?.items.slice(0, 3).map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(notification)}
                    className="dashboard-notification-item flex w-full cursor-pointer items-start gap-3 rounded-lg border-0 bg-transparent p-2 text-left hover:bg-gray-50"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.readAt ? 'bg-gray-300' : 'bg-blue-600'}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold leading-relaxed text-gray-700">
                        {notification.type === 'CHAT_MESSAGE'
                          ? `${notification.actorName || 'Người dùng'} đã gửi ${notification.unreadCount} tin nhắn mới${notification.jobTitle ? ` trong dự án “${notification.jobTitle}”` : ''}.`
                          : notification.message ||
                            [notification.actorName, notification.jobTitle]
                              .filter(Boolean)
                              .join(' · ') ||
                            'Có cập nhật mới.'}
                      </span>
                      <time
                        className="mt-1 block text-[10px] font-semibold text-gray-400"
                        dateTime={notification.createdAt}
                      >
                        {new Date(notification.createdAt).toLocaleString('vi-VN')}
                      </time>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-6 w-full border-t border-gray-100 pt-5 text-center">
                <button
                  type="button"
                  onClick={() => navigate(PATH_NOTIFICATIONS)}
                  className="cursor-pointer border-0 bg-transparent p-0 text-xs font-bold text-[#1D4ED8] hover:underline"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            </section>

            <section className="dashboard-primary-panel dashboard-support-panel relative flex flex-col items-start overflow-hidden rounded-3xl bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] p-6 text-white shadow-md">
              <h2 className="relative z-10 mb-2 text-lg font-bold">Cần hỗ trợ?</h2>
              <p className="relative z-10 text-[11px] leading-relaxed text-white/80">
                Tính năng đang được phát triển.
              </p>
            </section>
          </div>
        </div>
      </main>

      <FooterDashboard />
    </div>
  );
}
