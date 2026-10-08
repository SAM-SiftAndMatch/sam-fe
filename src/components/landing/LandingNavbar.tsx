import type React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as paths from '../../routes/paths';
import { useAuthStore } from '../../stores/useAuthStore';
import { PrimaryButton, SecondaryButton } from './LandingButtons';

interface NavItem {
  label: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tổng quan', id: 'hero' },
  { label: 'Quy trình', id: 'process' },
  { label: 'Tính năng', id: 'features' },
  { label: 'So sánh', id: 'comparison' },
  { label: 'Bảng giá', id: 'pricing' },
  { label: 'Đánh giá', id: 'testimonials' },
];

export const LandingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const dashboardPath =
    user?.role === 'FREELANCER' ? paths.PATH_FREELANCER : paths.PATH_CLIENT_DASHBOARD;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 24);

      // Section spy
      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop - 120;
          if (scrollY >= top) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className="sticky top-0 z-50 w-full h-16 flex items-center justify-center pointer-events-none transition-all duration-300">
      {/* Morphing Header Bar: Merged full-width when at top, shrinking to floating transparent bar when scrolling */}
      <div
        className={`w-full transition-all duration-300 ease-out flex items-center justify-between pointer-events-auto relative ${
          isScrolled
            ? 'max-w-[980px] h-[52px] translate-y-2 px-4 sm:px-6 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] mx-4'
            : 'max-w-[1200px] h-16 translate-y-0 px-4 sm:px-6 lg:px-8 rounded-none bg-transparent border-b border-transparent shadow-none mx-auto'
        }`}
      >
        {/* Logo - Left */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to={paths.PATH_HOME}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1D4ED8] rounded-[6px]"
          >
            <span
              className={`font-black tracking-tight text-[#1D4ED8] transition-all duration-200 ${
                isScrolled ? 'text-xl' : 'text-2xl'
              }`}
              style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
            >
              SAM
            </span>
            <span
              className={`hidden sm:inline-block font-mono text-[10px] text-slate-500 font-medium tracking-widest uppercase border-l border-slate-300 pl-2 transition-opacity duration-200 ${
                isScrolled ? 'opacity-80' : 'opacity-100'
              }`}
            >
              Sift & Match
            </span>
          </Link>
        </div>

        {/* Links - Center */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
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
        <div className="hidden sm:flex items-center gap-2">
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
              <PrimaryButton to={paths.PATH_REGISTER} size={isScrolled ? 'sm' : 'default'}>
                Bắt đầu ngay
              </PrimaryButton>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="sm:hidden flex items-center gap-1.5">
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
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#1D4ED8] hover:bg-slate-50 rounded-[6px]"
              >
                {item.label}
              </button>
            ))}
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
                  <PrimaryButton to={paths.PATH_REGISTER} size="sm" className="w-full">
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
