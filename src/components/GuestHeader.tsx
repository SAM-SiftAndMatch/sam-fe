import type React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as paths from '../routes/paths';

export type NavItem = {
  label: string;
  id: string;
};

interface GuestHeaderProps {
  navItems?: NavItem[];
}

const GuestHeader: React.FC<GuestHeaderProps> = ({ navItems }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!navItems) return;

    const handleScroll = () => {
      let currentActive = '';
      for (const item of navItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust 150 based on header height + offset
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentActive = item.id;
          }
        }
      }
      if (currentActive !== activeId) {
        setActiveId(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems, activeId]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="w-full h-[72px] px-6 md:px-10 flex items-center relative border-b border-gray-100 bg-white sticky top-0 z-50">
      {/* Logo - Left */}
      <div className="flex-1 flex items-center">
        <Link
          to={paths.PATH_HOME}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-1 cursor-pointer group"
        >
          <div
            className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] group-hover:from-[#0AAAD7] group-hover:to-[#1D4ED8] transition-all duration-300"
            style={{ fontFamily: "'Quedora', sans-serif" }}
          >
            SAM
          </div>
        </Link>
      </div>

      {/* Navigation - Center (Absolute) */}
      <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-4 lg:gap-6">
        {navItems ? (
          navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`text-sm font-semibold px-4 py-1.5 rounded-full cursor-pointer border-0 transition-colors ${
                  isActive
                    ? 'bg-[#EEF2FF] text-[#1D4ED8]'
                    : 'text-gray-600 hover:text-[#0047FF] bg-transparent hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            );
          })
        ) : (
          <>
            <button
              type="button"
              className="text-sm font-semibold text-gray-600 hover:text-[#0047FF] hover:bg-gray-50 px-4 py-1.5 rounded-full cursor-pointer bg-transparent border-0 transition-colors"
            >
              Khách hàng
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-gray-600 hover:text-[#0047FF] hover:bg-gray-50 px-4 py-1.5 rounded-full cursor-pointer bg-transparent border-0 transition-colors"
            >
              Freelancer
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-gray-600 hover:text-[#0047FF] hover:bg-gray-50 px-4 py-1.5 rounded-full cursor-pointer bg-transparent border-0 transition-colors"
            >
              Dịch vụ
            </button>
          </>
        )}
      </nav>

      {/* Navigation Right */}
      <div className="flex-1 flex items-center justify-end gap-6">
        <Link
          to={paths.PATH_LOGIN}
          className="text-sm font-semibold text-gray-600 hover:text-[#0047FF] cursor-pointer bg-transparent border-0 p-0 hidden md:block"
        >
          Đăng nhập
        </Link>
        <Link
          to={paths.PATH_REGISTER}
          className="bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] hover:opacity-90 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md transition-opacity cursor-pointer border-0"
        >
          Bắt đầu ngay
        </Link>
      </div>

      {/* Hamburger Menu Button (Mobile Only) */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden ml-4 text-gray-500 hover:text-[#1D4ED8] transition-colors p-1"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          role="img"
          aria-label="Menu"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-white border-b border-gray-100 shadow-lg flex flex-col p-4 gap-2">
          {navItems ? (
            navItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToSection(item.id);
                  }}
                  className={`text-sm font-semibold px-4 py-3 rounded-xl text-left border-0 transition-colors ${
                    isActive
                      ? 'bg-[#EEF2FF] text-[#1D4ED8]'
                      : 'text-gray-600 bg-transparent hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })
          ) : (
            <>
              <button
                type="button"
                className="text-sm font-semibold text-gray-600 bg-transparent px-4 py-3 rounded-xl text-left border-0 transition-colors hover:bg-gray-50"
              >
                Khách hàng
              </button>
              <button
                type="button"
                className="text-sm font-semibold text-gray-600 bg-transparent px-4 py-3 rounded-xl text-left border-0 transition-colors hover:bg-gray-50"
              >
                Freelancer
              </button>
              <button
                type="button"
                className="text-sm font-semibold text-gray-600 bg-transparent px-4 py-3 rounded-xl text-left border-0 transition-colors hover:bg-gray-50"
              >
                Dịch vụ
              </button>
            </>
          )}
          <hr className="border-gray-100 my-2" />
          <Link
            to={paths.PATH_LOGIN}
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 px-6 py-3 rounded-xl cursor-pointer transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      )}
    </header>
  );
};

export default GuestHeader;
