import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  Banknote,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import SamBrandLogo from '../SamBrandLogo';

const navigation = [
  {
    group: 'TỔNG QUAN',
    items: [
      { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
      { to: '/admin/revenue', label: 'Doanh thu nền tảng', icon: CircleDollarSign },
      { to: '/admin/users', label: 'Người dùng', icon: Users },
    ],
  },
  {
    group: 'VẬN HÀNH TÀI CHÍNH',
    items: [
      { to: '/admin/finance/payment-cases', label: 'Sự cố thanh toán', icon: FileCheck2 },
      { to: '/admin/finance/receipts', label: 'Đối soát tiền vào', icon: ArrowDownLeft },
      { to: '/admin/finance/checkout-review', label: 'Gói & giao dịch', icon: CreditCard },
      { to: '/admin/finance/withdrawals', label: 'Chi trả freelancer', icon: Wallet },
      { to: '/admin/finance/banks', label: 'Tài khoản ngân hàng', icon: Banknote },
    ],
  },
  {
    group: 'DỊCH VỤ & KIỂM SOÁT',
    items: [
      { to: '/admin/finance/tickets', label: 'Ticket bảo trì', icon: Ticket },
      { to: '/admin/finance/audit', label: 'Nhật ký vận hành', icon: History },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const cache = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const dialog = useRef<HTMLDialogElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const active = navigation
    .flatMap((group) => group.items)
    .find((item) => item.to === location.pathname);
  const initials = (user?.fullName || 'Admin')
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const signOut = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      await logout();
    } catch {
      /* Local session is cleared by the auth store. */
    } finally {
      cache.clear();
      navigate('/login', { replace: true });
    }
  };
  const sidebar = (compact: boolean, mobile = false) => (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div
        className={`flex h-20 shrink-0 items-center border-b border-slate-100 ${compact ? 'justify-center px-2' : 'justify-between px-6'}`}
      >
        <NavLink
          to="/admin"
          aria-label="SAM — Tổng quan quản trị"
          onClick={() => dialog.current?.close()}
          className={`flex items-center overflow-hidden ${compact ? 'w-12' : ''}`}
        >
          <span className={compact ? 'admin-sidebar-compact' : 'flex'}>
            <SamBrandLogo showTagline={false} />
          </span>
        </NavLink>
        {!compact && (
          <button
            type="button"
            aria-label={mobile ? 'Đóng điều hướng' : 'Thu gọn sidebar'}
            onClick={() => (mobile ? dialog.current?.close() : setCollapsed(true))}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
          >
            {mobile ? <X size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>
      {compact && (
        <button
          type="button"
          aria-label="Mở rộng sidebar"
          title="Mở rộng sidebar"
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        >
          <ChevronRight size={18} />
        </button>
      )}
      <nav
        aria-label="Quản trị SAM"
        className={`min-h-0 flex-1 overflow-y-auto py-5 ${compact ? 'px-3' : 'px-4'}`}
      >
        {navigation.map((group) => (
          <div key={group.group} className="mb-6">
            {!compact && (
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[.16em] text-slate-400">
                {group.group}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item && item.end}
                  title={compact ? item.label : undefined}
                  aria-label={compact ? item.label : undefined}
                  onClick={() => dialog.current?.close()}
                  className={({ isActive }) =>
                    `group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${compact ? 'justify-center' : ''} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`
                  }
                >
                  <item.icon size={19} strokeWidth={1.8} className="shrink-0" />
                  {!compact && <span className="min-w-0 flex-1">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className={`shrink-0 border-t border-slate-100 p-4 ${compact ? 'text-center' : ''}`}>
        <div className={`flex items-center gap-3 ${compact ? 'justify-center' : ''}`}>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800"
            aria-hidden="true"
          >
            {initials}
          </span>
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.fullName || 'Quản trị viên'}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={leaving}
          title="Đăng xuất"
          aria-label="Đăng xuất"
          onClick={() => void signOut()}
          className={`mt-3 flex w-full items-center gap-3 rounded-xl p-2.5 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 ${compact ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!compact && (leaving ? 'Đang đăng xuất…' : 'Đăng xuất')}
        </button>
      </div>
    </div>
  );
  return (
    <div className="admin-shell min-h-dvh bg-[#f7f9fc] text-slate-900 lg:flex">
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 border-r border-slate-200/70 transition-[width] duration-200 lg:block ${collapsed ? 'w-20' : 'w-[260px]'}`}
      >
        {sidebar(collapsed)}
      </aside>
      <dialog
        ref={dialog}
        aria-label="Điều hướng quản trị"
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-[285px] max-w-[85vw] border-0 p-0 shadow-2xl backdrop:bg-slate-950/40"
      >
        {sidebar(false, true)}
      </dialog>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-slate-200/70 bg-white/95 px-5 backdrop-blur lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Mở điều hướng quản trị"
              onClick={() => dialog.current?.showModal()}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="hidden text-slate-400 sm:inline">Không gian quản trị</span>
              <ChevronRight size={14} className="hidden text-slate-300 sm:block" />
              <span className="truncate font-semibold">
                {active?.label || 'Tài chính & bảo trì'}
              </span>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700">
            <ShieldCheck size={14} />
            Quản trị viên
          </span>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-5 sm:p-7 lg:p-9">
          <Outlet />
        </main>
        <footer className="px-5 pb-6 text-xs text-slate-400 lg:px-9">
          SAM · Không gian vận hành nền tảng
        </footer>
      </div>
    </div>
  );
}
