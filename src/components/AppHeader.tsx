import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  PATH_FREELANCER_JOBS,
  PATH_FREELANCER_PROJECTS,
  PATH_HOME,
  PATH_JOB_DETAIL,
  PATH_LOGIN,
  PATH_REGISTER,
  PATH_WORKSPACE,
  PATH_WORKSPACES,
} from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';
import ThemeToggle from './ThemeToggle';

type NavItem = { label: string; path: string; state?: { role: 'client' | 'freelancer' } };

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, clear } = useInviteNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const isClient = user?.role === 'CLIENT';

  const navItems: NavItem[] = isClient
    ? [
        { label: 'Dự án', path: PATH_CLIENT_PROJECTS },
        { label: 'Tin nhắn', path: PATH_WORKSPACES, state: { role: 'client' } },
        { label: 'Tìm Freelancer', path: PATH_CLIENT_FIND_FREELANCER },
      ]
    : [
        { label: 'Tìm việc', path: PATH_FREELANCER_JOBS },
        { label: 'Ứng tuyển', path: PATH_FREELANCER_APPLICATIONS },
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
        {item.label}
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
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          aria-label="Về trang chính SAM"
        >
          <span
            className={`bg-gradient-to-r from-[#1D4ED8] via-[#0066FF] to-[#0AAAD7] bg-clip-text font-extrabold leading-none tracking-tighter text-transparent transition-all duration-300 ${
              isScrolled ? 'text-2xl sm:text-[28px]' : 'text-3xl sm:text-[38px]'
            }`}
          >
            SAM
          </span>
          <span
            className={`hidden border-l border-slate-200 pl-2 text-[10px] font-medium uppercase tracking-widest text-slate-500 transition-opacity duration-200 xl:inline ${
              isScrolled ? 'opacity-80' : 'opacity-100'
            }`}
          >
            Sift &amp; Match
          </span>
        </button>

        <nav
          className={`hidden min-w-0 flex-1 items-center justify-center lg:flex ${isScrolled ? 'gap-2' : 'gap-1'}`}
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
                  onClick={() => navigate(PATH_CLIENT_AI_BRIEF)}
                  className="hidden rounded-full bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#153bb5] xl:inline-flex"
                >
                  Đăng dự án
                </button>
              )}
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((value) => !value)}
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
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={clear}
                          className="text-[11px] font-semibold text-slate-500 hover:text-[#1D4ED8]"
                        >
                          Xóa hết
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-slate-500">
                        Chưa có thông báo nào.
                      </p>
                    ) : (
                      notifications.map((notification, index) => (
                        <button
                          key={`${notification.jobId}-${notification.timestamp}-${index}`}
                          type="button"
                          onClick={() =>
                            openNotification(
                              notification.jobId,
                              notification.roomId,
                              notification.type
                            )
                          }
                          className="w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                        >
                          <p className="text-xs font-bold text-slate-800">
                            {notification.type === '1_TOUCH_INVITE'
                              ? '🔥 Lời mời tuyển gấp'
                              : notification.type === 'DEV_CLAIM'
                                ? '🙋 Dev muốn chat'
                                : notification.type === 'CHAT_OPENED'
                                  ? '💬 Đã mở phòng chat'
                                  : notification.type === 'PROPOSAL_RECEIVED'
                                    ? '📨 Hồ sơ ứng tuyển mới'
                                    : notification.type === 'PROPOSAL_INVITE'
                                      ? '🤝 Client mời hợp tác'
                                      : notification.type === 'PROPOSAL_ACCEPTED'
                                        ? '✅ Dev đã đồng ý hợp tác'
                                        : notification.type === 'PROPOSAL_REJECTED'
                                          ? '🚫 Hồ sơ bị từ chối'
                                          : 'Có cập nhật mới'}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                            {notification.jobTitle ||
                              notification.message ||
                              'Có cập nhật mới cho dự án'}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="relative hidden sm:block" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  className="flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 transition-colors hover:bg-slate-100"
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
                    className="h-3.5 w-3.5 text-slate-400"
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
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Mở điều hướng"
            aria-expanded={mobileOpen}
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
      </div>

      {mobileOpen && (
        <div className="pointer-events-auto border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
            {isAuthenticated && (
              <div className="mb-2 border-b border-slate-100 px-3 pb-3">
                <p className="text-sm font-bold text-slate-800">{user?.fullName || user?.email}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {isClient ? 'Tài khoản khách hàng' : 'Tài khoản freelancer'}
                </p>
              </div>
            )}
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
            {isClient && (
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  navigate(PATH_CLIENT_AI_BRIEF);
                }}
                className="mt-2 rounded-lg bg-[#1D4ED8] px-4 py-3 text-left text-sm font-bold text-white hover:bg-[#153bb5]"
              >
                Đăng dự án
              </button>
            )}
            <div className="mt-2 border-t border-slate-100 pt-2">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenus();
                      navigate(profilePath);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {profileLabel}
                  </button>
                  <button
                    type="button"
                    onClick={logoutAndRedirect}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
