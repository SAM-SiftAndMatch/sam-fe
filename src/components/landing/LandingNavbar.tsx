import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as paths from '../../routes/paths';
import { useAuthStore } from '../../stores/useAuthStore';
import SamBrandLogo from '../SamBrandLogo';
import ThemeToggle from '../ThemeToggle';
import { PrimaryButton, SecondaryButton } from './LandingButtons';

export interface NavItem {
  label: string;
  id?: string;
  path?: string;
}

const DEFAULT_LANDING_ITEMS: NavItem[] = [
  { label: 'Tổng quan', id: 'hero' },
  { label: 'Quy trình', id: 'process' },
  { label: 'Tính năng', id: 'features' },
  { label: 'So sánh', id: 'comparison' },
  { label: 'Bảng giá', id: 'pricing' },
  { label: 'Đánh giá', id: 'testimonials' },
];

const DEFAULT_PAGE_LINKS: NavItem[] = [
  { label: 'Khách hàng', path: paths.PATH_HOME },
  { label: 'Freelancer', path: paths.PATH_FREELANCER },
  { label: 'Bảng giá', path: paths.PATH_CLIENT_PRICING },
];

interface LandingNavbarProps {
  navItems?: NavItem[];
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ navItems }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const isHome = location.pathname === paths.PATH_HOME || location.pathname === paths.PATH_HOME_ALT;

  // Resolve items to render
  const resolvedItems = navItems || (isHome ? DEFAULT_LANDING_ITEMS : DEFAULT_PAGE_LINKS);

  const dashboardPath =
    user?.role === 'FREELANCER' ? paths.PATH_FREELANCER : paths.PATH_CLIENT_DASHBOARD;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 24);

      // Section spy only for items with id
      for (let i = resolvedItems.length - 1; i >= 0; i--) {
        const item = resolvedItems[i];
        if (item.id) {
          const el = document.getElementById(item.id);
          if (el) {
            const top = el.offsetTop - 120;
            if (scrollY >= top) {
              setActiveSection(item.id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [resolvedItems]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 72;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 shrink-0 flex items-center justify-center pointer-events-none">
      <div
        className={`page-header-surface pointer-events-auto relative flex w-full items-center justify-between border border-transparent transition-all duration-300 ease-out motion-reduce:transition-none ${
          isScrolled
            ? 'mx-4 h-[56px] translate-y-2 rounded-full px-5 sm:px-7 xl:mx-auto xl:w-[84%]'
            : 'mx-0 h-16 translate-y-0 rounded-none px-4 sm:px-6 lg:px-8'
        }`}
        data-scrolled={isScrolled}
      >
        {/* Logo - Left */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to={paths.PATH_HOME}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1D4ED8] rounded-[6px]"
          >
            <SamBrandLogo isScrolled={isScrolled} />
          </Link>
        </div>

        {/* Links - Center */}
        <nav className={`hidden items-center md:flex ${isScrolled ? 'gap-2' : 'gap-1'}`}>
          {resolvedItems.map((item) => {
            if (item.path) {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border-0 ${
                    isActive
                      ? 'text-[#1D4ED8] bg-[#1D4ED8]/[0.08]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.label}
                </Link>
              );
            }

            const isActive = activeSection === item.id;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => item.id && scrollTo(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border-0 ${
                  isActive
                    ? 'text-[#1D4ED8] bg-[#1D4ED8]/[0.08]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions - Right */}
        <div className={`hidden items-center sm:flex ${isScrolled ? 'gap-3' : 'gap-2'}`}>
          <ThemeToggle />
          {isAuthenticated ? (
            <PrimaryButton to={dashboardPath} size={isScrolled ? 'sm' : 'default'}>
              Bảng điều khiển
            </PrimaryButton>
          ) : (
            <>
              <Link
                to={paths.PATH_LOGIN}
                className={`inline-flex items-center font-medium text-slate-600 hover:text-[#1D4ED8] transition-all rounded-[8px] focus-visible:outline-2 focus-visible:outline-[#1D4ED8] ${
                  isScrolled ? 'h-[38px] px-3 text-xs' : 'h-[44px] px-4 text-sm'
                }`}
              >
                Đăng nhập
              </Link>
              <PrimaryButton
                to={paths.PATH_REGISTER}
                withArrow={false}
                size={isScrolled ? 'sm' : 'default'}
              >
                Bắt đầu ngay
              </PrimaryButton>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="sm:hidden flex items-center gap-1.5">
          <ThemeToggle />
          {!isAuthenticated && (
            <Link
              to={paths.PATH_LOGIN}
              className="text-xs font-medium text-slate-700 px-2.5 py-1.5 rounded-[6px]"
            >
              Đăng nhập
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-[6px] focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[calc(100%+8px)] left-0 right-0 w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-[14px] p-4 shadow-xl flex flex-col gap-2 z-50">
            {resolvedItems.map((item) => {
              if (item.path) {
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#1D4ED8] hover:bg-slate-50 rounded-[6px]"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.id && scrollTo(item.id)}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#1D4ED8] hover:bg-slate-50 rounded-[6px]"
                >
                  {item.label}
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <PrimaryButton to={dashboardPath} size="sm" className="w-full">
                  Bảng điều khiển
                </PrimaryButton>
              ) : (
                <>
                  <SecondaryButton to={paths.PATH_LOGIN} size="sm" className="w-full">
                    Đăng nhập
                  </SecondaryButton>
                  <PrimaryButton
                    to={paths.PATH_REGISTER}
                    withArrow={false}
                    size="sm"
                    className="w-full"
                  >
                    Bắt đầu ngay
                  </PrimaryButton>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingNavbar;
