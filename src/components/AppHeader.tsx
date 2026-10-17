import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { chatApi } from '../api/chat';
import { useInviteNotifications } from '../hooks/useInviteNotifications';
import {
  PATH_CLIENT_AI_BRIEF,
  PATH_CLIENT_DASHBOARD,
  PATH_CLIENT_FIND_FREELANCER,
  PATH_CLIENT_PRICING,
  PATH_CLIENT_PROFILE,
  PATH_CLIENT_PROJECTS,
  PATH_CLIENT_PROJECT_DETAIL,
  PATH_FREELANCER,
  PATH_FREELANCER_APPLICATIONS,
  PATH_FREELANCER_CREATE_PROFILE,
  PATH_FREELANCER_EARNINGS,
  PATH_FREELANCER_INVITATIONS,
  PATH_FREELANCER_JOBS,
  PATH_FREELANCER_PROJECTS,
  PATH_HOME,
  PATH_JOB_DETAIL,
  PATH_LOGIN,
  PATH_NOTIFICATIONS,
  PATH_REGISTER,
  PATH_WORKSPACE,
  PATH_WORKSPACES,
} from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';
import SamBrandLogo from './SamBrandLogo';
import ThemeToggle from './ThemeToggle';

type NavItem = { label: string; path: string; state?: { role: 'client' | 'freelancer' } };

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, markRead, clear } = useInviteNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const isClient = user?.role === 'CLIENT';
  const chatUnread = useQuery({
    queryKey: ['chat-unread-count', user?.userId],
    queryFn: chatApi.unreadCount,
    enabled: Boolean(isAuthenticated && user?.userId),
    staleTime: 10_000,
  });

  const navItems: NavItem[] = isClient
    ? [
        { label: 'Dự án', path: PATH_CLIENT_PROJECTS },
        { label: 'Tin nhắn', path: PATH_WORKSPACES, state: { role: 'client' } },
        { label: 'Tìm Freelancer', path: PATH_CLIENT_FIND_FREELANCER },
      ]
    : [
        { label: 'Tìm việc', path: PATH_FREELANCER_JOBS },
        { label: 'Ứng tuyển', path: PATH_FREELANCER_APPLICATIONS },
        { label: 'Lời mời', path: PATH_FREELANCER_INVITATIONS },
        { label: 'Dự án của tôi', path: PATH_FREELANCER_PROJECTS },
        { label: 'Tin nhắn', path: PATH_WORKSPACES, state: { role: 'freelancer' } },
        { label: 'Thu nhập', path: PATH_FREELANCER_EARNINGS },
      ];
  const profilePath = isClient ? PATH_CLIENT_PROFILE : PATH_FREELANCER_CREATE_PROFILE;
  const profileLabel = isClient ? 'Hồ sơ công ty' : 'Hồ sơ của tôi';
  const homePath = isClient ? PATH_CLIENT_DASHBOARD : PATH_FREELANCER;

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node))
        setAccountOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node))
        setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!mobileMenuRef.current?.contains(target) && !mobileButtonRef.current?.contains(target))
        setMobileOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileOpen(false);
      mobileButtonRef.current?.focus();
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  const closeMenus = () => {
    setMobileOpen(false);
    setAccountOpen(false);
    setNotificationsOpen(false);
  };
  const go = (item: NavItem) => {
    closeMenus();
    navigate(item.path, item.state ? { state: item.state } : undefined);
  };
  const logoutAndRedirect = async () => {
    closeMenus();
    await logout();
    navigate(PATH_LOGIN);
  };
  const isActive = (path: string) =>
    path === PATH_WORKSPACES
      ? location.pathname === PATH_WORKSPACES || location.pathname.startsWith('/workspace/')
      : location.pathname === path || location.pathname.startsWith(`${path}/`);
  const navClass = (path: string) =>
    `app-header-nav-item cursor-pointer rounded-full px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
      isActive(path)
        ? 'app-header-nav-item--active bg-[#1D4ED8]/10 text-[#1D4ED8]'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;
  const openNotification = (jobId?: string | null, roomId?: string | null, type?: string) => {
    setNotificationsOpen(false);
    if (roomId) return navigate(PATH_WORKSPACE.replace(':projectId', roomId));
    if (!isClient && type?.startsWith('JOB_INVITE')) return navigate(PATH_FREELANCER_INVITATIONS);
    if (!jobId) return;
    navigate(
      isClient && type !== '1_TOUCH_INVITE'
        ? PATH_CLIENT_PROJECT_DETAIL.replace(':id', jobId)
        : PATH_JOB_DETAIL.replace(':id', jobId)
    );
  };

  const renderNav = (mobile = false) =>
    navItems.map((item) => (
      <button
        key={item.label}
        type="button"
        onClick={() => go(item)}
        className={`${navClass(item.path)} ${mobile ? 'w-full text-left text-sm' : ''}`}
      >
        <span className="inline-flex items-center gap-1.5">
          {item.label}
          {item.label === 'Tin nhắn' && (chatUnread.data ?? 0) > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
              {(chatUnread.data ?? 0) > 99 ? '99+' : chatUnread.data}
            </span>
          )}
        </span>
      </button>
    ));

  return (
    <header className="app-header sticky top-0 z-50 flex h-16 w-full items-center justify-center pointer-events-none transition-all duration-300">
      <div
        className={`app-header-shell pointer-events-auto relative flex w-full items-center justify-between gap-3 transition-all duration-300 ease-out ${
          isScrolled
            ? 'app-header-shell--scrolled mx-4 h-[56px] max-w-[1160px] translate-y-2 rounded-full border border-slate-200/80 bg-white/80 px-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-md sm:px-7'
            : 'mx-auto h-16 max-w-[1440px] border-b border-transparent bg-transparent px-4 sm:px-6 lg:px-8'
        }`}
      >
        <button
          type="button"
          onClick={() => navigate(isAuthenticated ? homePath : PATH_HOME)}
          className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          aria-label="Về trang chính SAM"
        >
          <SamBrandLogo isScrolled={isScrolled} />
        </button>

        <nav
          className={`hidden min-w-0 flex-1 items-center justify-center xl:flex ${isScrolled ? 'gap-2' : 'gap-1'}`}
          aria-label="Điều hướng chính"
        >
          {isAuthenticated ? (
            renderNav()
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate(PATH_HOME)}
                className={navClass(PATH_HOME)}
              >
                Khách hàng
              </button>
              <button
                type="button"
                onClick={() => navigate(PATH_FREELANCER)}
                className={navClass(PATH_FREELANCER)}
              >
                Freelancer
              </button>
              <button
                type="button"
                onClick={() => navigate(PATH_CLIENT_PRICING)}
                className={navClass(PATH_CLIENT_PRICING)}
              >
                Bảng giá
              </button>
            </>
          )}
        </nav>

        <div
          className={`ml-auto flex shrink-0 items-center ${isScrolled ? 'gap-3' : 'gap-2 sm:gap-3'}`}
        >
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              {isClient && (
                <button
                  type="button"
                  onClick={() => navigate(PATH_CLIENT_AI_BRIEF, { state: { resetBrief: true } })}
                  className="hidden rounded-full bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#153bb5] xl:inline-flex"
                >
                  Đăng dự án
                </button>
              )}
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setAccountOpen(false);
                    setNotificationsOpen((value) => !value);
                  }}
                  className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#1D4ED8]"
                  aria-label="Mở thông báo"
                  aria-expanded={notificationsOpen}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                      <p className="text-xs font-bold text-slate-800">Thông báo</p>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={clear}
                          className="text-[11px] font-semibold text-slate-500 hover:text-[#1D4ED8]"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-slate-500">
                        Chưa có thông báo nào.
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => {
                            void markRead(notification.id);
                            openNotification(
                              notification.jobId,
                              notification.roomId,
                              notification.type
                            );
                          }}
                          className={`w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 ${notification.readAt ? '' : 'bg-blue-50/50'}`}
                        >
                          <p className="text-xs font-bold text-slate-800">
                            {notification.type === 'PROJECT_ADDON_PAYMENT_PENDING'
                              ? 'Chưa thanh toán tính năng dự án'
                              : notification.type === 'PROJECT_ADDON_PAYMENT_PAID'
                                ? 'Đã kích hoạt tính năng dự án'
                                : notification.type === 'PROJECT_ADDON_PAYMENT_REVIEW'
                                  ? 'Thanh toán tính năng cần hỗ trợ'
                                  : notification.type === '1_TOUCH_INVITE'
                                    ? '🔥 Lời mời tuyển gấp'
                                    : notification.type === 'JOB_INVITE'
                                      ? 'Lời mời làm việc mới'
                                      : notification.type === 'JOB_INVITE_ACCEPTED'
                                        ? 'Freelancer đã đồng ý lời mời'
                                        : notification.type === 'JOB_INVITE_DECLINED'
                                          ? 'Freelancer đã từ chối lời mời'
                                          : notification.type === 'JOB_INVITE_WITHDRAWN'
                                            ? 'Lời mời đã được thu hồi'
                                            : notification.type === 'JOB_INVITE_SELECTED'
                                              ? 'Bạn được chọn cho dự án'
                                              : notification.type === 'JOB_INVITE_NOT_SELECTED'
                                                ? 'Dự án đã chọn freelancer khác'
                                                : notification.type === 'CHAT_MESSAGE'
                                                  ? 'Tin nhắn mới'
                                                  : notification.type === 'DEV_CLAIM'
                                                    ? '🙋 Dev muốn chat'
                                                    : notification.type === 'CHAT_OPENED'
                                                      ? '💬 Đã mở phòng chat'
                                                      : notification.type === 'PROPOSAL_RECEIVED'
                                                        ? '📨 Hồ sơ ứng tuyển mới'
                                                        : notification.type === 'PROPOSAL_INVITE'
                                                          ? '🤝 Client mời hợp tác'
                                                          : notification.type ===
                                                              'PROPOSAL_ACCEPTED'
                                                            ? '✅ Dev đã đồng ý hợp tác'
                                                            : notification.type ===
                                                                'PROPOSAL_REJECTED'
                                                              ? '🚫 Hồ sơ bị từ chối'
                                                              : 'Có cập nhật mới'}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                            {notification.type.startsWith('PROJECT_ADDON_')
                              ? notification.message || notification.jobTitle
                              : notification.type === 'CHAT_MESSAGE'
                                ? `${notification.actorName || 'Người dùng'} • ${notification.unreadCount} tin nhắn mới${notification.jobTitle ? ` • ${notification.jobTitle}` : ''}`
                                : notification.actorName
                                  ? `${notification.actorName} • ${notification.jobTitle || notification.message || 'Có cập nhật mới cho dự án'}`
                                  : notification.jobTitle ||
                                    notification.message ||
                                    'Có cập nhật mới cho dự án'}
                          </p>
                        </button>
                      ))
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate(PATH_NOTIFICATIONS);
                      }}
                      className="w-full px-4 py-3 text-center text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                )}
              </div>
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setNotificationsOpen(false);
                    setAccountOpen((value) => !value);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-0 transition-colors hover:bg-slate-100 sm:w-auto sm:gap-2 sm:px-3"
                  aria-label="Mở menu tài khoản"
                  aria-expanded={accountOpen}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1D4ED8]/10 text-[10px] font-bold text-[#1D4ED8]">
                    {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-28 truncate text-xs font-semibold text-slate-700 md:inline">
                    {user?.fullName || user?.email}
                  </span>
                  <svg
                    className="hidden h-3.5 w-3.5 text-slate-400 sm:block"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                    <div className="mb-1 border-b border-slate-100 px-4 py-2.5">
                      <p className="truncate text-xs font-bold text-slate-800">
                        {user?.fullName || 'Tài khoản'}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">{user?.email}</p>
                      <span className="mt-1.5 inline-flex rounded-full bg-[#1D4ED8]/10 px-2 py-0.5 text-[10px] font-bold text-[#1D4ED8]">
                        {isClient ? 'KHÁCH HÀNG' : 'FREELANCER'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenus();
                        navigate(profilePath);
                      }}
                      className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {profileLabel}
                    </button>
                    <button
                      type="button"
                      onClick={logoutAndRedirect}
                      className="w-full px-4 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => navigate(PATH_LOGIN)}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#1D4ED8]"
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => navigate(PATH_REGISTER)}
                className="rounded-full bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#153bb5]"
              >
                Bắt đầu ngay
              </button>
            </div>
          )}
          <button
            ref={mobileButtonRef}
            type="button"
            onClick={() => {
              setAccountOpen(false);
              setNotificationsOpen(false);
              setMobileOpen((value) => !value);
            }}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 xl:hidden"
            aria-label={mobileOpen ? 'Đóng điều hướng' : 'Mở điều hướng'}
            aria-expanded={mobileOpen}
            aria-controls="app-header-mobile-menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={mobileOpen ? 'M6 18 18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        <div
          id="app-header-mobile-menu"
          ref={mobileMenuRef}
          aria-hidden={!mobileOpen}
          className={`absolute right-0 top-[calc(100%+8px)] z-50 w-64 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-5rem)] origin-top-right overflow-y-auto rounded-xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-md transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none xl:hidden ${
            mobileOpen
              ? 'visible pointer-events-auto translate-y-0 scale-100 opacity-100'
              : 'invisible pointer-events-none -translate-y-2 scale-[0.98] opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-1" aria-label="Điều hướng thu gọn">
            {isAuthenticated ? (
              renderNav(true)
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => go({ label: 'Khách hàng', path: PATH_HOME })}
                  className={`${navClass(PATH_HOME)} w-full text-left text-sm`}
                >
                  Khách hàng
                </button>
                <button
                  type="button"
                  onClick={() => go({ label: 'Freelancer', path: PATH_FREELANCER })}
                  className={`${navClass(PATH_FREELANCER)} w-full text-left text-sm`}
                >
                  Freelancer
                </button>
                <button
                  type="button"
                  onClick={() => go({ label: 'Bảng giá', path: PATH_CLIENT_PRICING })}
                  className={`${navClass(PATH_CLIENT_PRICING)} w-full text-left text-sm`}
                >
                  Bảng giá
                </button>
              </>
            )}
            {isAuthenticated && isClient && (
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  navigate(PATH_CLIENT_AI_BRIEF, { state: { resetBrief: true } });
                }}
                className="mt-2 rounded-lg bg-[#1D4ED8] px-4 py-3 text-left text-sm font-bold text-white hover:bg-[#153bb5]"
              >
                Đăng dự án
              </button>
            )}
            {!isAuthenticated && (
              <div className="mt-2 border-t border-slate-100 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeMenus();
                    navigate(PATH_LOGIN);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenus();
                    navigate(PATH_REGISTER);
                  }}
                  className="mt-1 w-full rounded-lg bg-[#1D4ED8] px-3 py-2 text-left text-sm font-bold text-white hover:bg-[#153bb5]"
                >
                  Bắt đầu ngay
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
