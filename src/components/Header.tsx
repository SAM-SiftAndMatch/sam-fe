import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PATH_FREELANCER,
  PATH_FREELANCER_APPLICATIONS,
  PATH_FREELANCER_CREATE_PROFILE,
  PATH_FREELANCER_EARNINGS,
  PATH_FREELANCER_JOBS,
  PATH_FREELANCER_PRICING,
  PATH_FREELANCER_PROJECTS,
  PATH_HOME,
  PATH_LOGIN,
  PATH_REGISTER,
  PATH_WORKSPACES,
} from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate(PATH_LOGIN);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNavClass = (path: string, hasIcon = false) => {
    const isActive = path === '/' ? location.pathname === path : location.pathname.startsWith(path);
    const baseClass = 'text-sm px-4 py-2 rounded-full cursor-pointer border-0 transition-colors';
    const activeClass = 'font-bold bg-[#EEF2FF] text-[#0047FF]';
    const inactiveClass =
      'font-medium text-gray-600 hover:text-[#0047FF] hover:bg-gray-50 bg-transparent';
    const iconClass = hasIcon ? 'flex items-center gap-1' : '';

    return `${baseClass} ${isActive ? activeClass : inactiveClass} ${iconClass}`.trim();
  };

  return (
    <header className="w-full py-4 px-6 md:px-10 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
      {/* Logo - Left */}
      <div className="flex-1 flex items-center">
        <span
          onClick={() => navigate(PATH_FREELANCER)}
          className="flex items-center gap-1 cursor-pointer group"
        >
          <div
            className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] group-hover:from-[#0AAAD7] group-hover:to-[#1D4ED8] transition-all duration-300"
            style={{ fontFamily: "'Quedora', sans-serif" }}
          >
            SAM
          </div>
        </span>
      </div>

      {/* Navigation - Center */}
      <nav className="hidden md:flex items-center justify-center gap-2 flex-1">
        {isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={() => navigate(PATH_FREELANCER_JOBS)}
              className={getNavClass(PATH_FREELANCER_JOBS, true)}
            >
              Tìm việc
            </button>
            <button
              type="button"
              onClick={() => navigate(PATH_FREELANCER_APPLICATIONS)}
              className={getNavClass(PATH_FREELANCER_APPLICATIONS)}
            >
              Chờ phản hồi
            </button>
            <button
              type="button"
              onClick={() => navigate(PATH_WORKSPACES, { state: { role: 'freelancer' } })}
              className={getNavClass('/workspace')}
            >
              Tin nhắn
            </button>
            <button
              type="button"
              onClick={() => navigate(PATH_FREELANCER_PROJECTS)}
              className={getNavClass(PATH_FREELANCER_PROJECTS)}
            >
              Dự án của tôi
            </button>
            <button
              type="button"
              onClick={() => navigate(PATH_FREELANCER_EARNINGS)}
              className={getNavClass(PATH_FREELANCER_EARNINGS)}
            >
              Thu nhập
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate(PATH_HOME)}
              className={getNavClass(PATH_HOME)}
            >
              Khách hàng
            </button>
            <button
              type="button"
              onClick={() => navigate(PATH_FREELANCER)}
              className={getNavClass(PATH_FREELANCER)}
            >
              Freelancer
            </button>
            <button
              type="button"
              onClick={() => navigate(PATH_FREELANCER_PRICING)}
              className={getNavClass(PATH_FREELANCER_PRICING)}
            >
              Dịch vụ
            </button>
          </>
        )}
      </nav>

      {/* Actions - Right */}
      <div className="flex-1 flex items-center justify-end gap-4 md:gap-5">
        {isAuthenticated ? (
          <>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-800 cursor-pointer bg-transparent border-0 p-0"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                role="img"
                aria-label="Notification"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-9 px-3 rounded-full bg-gray-100 flex items-center gap-2 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  role="img"
                  aria-label="Profile"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {user && (
                  <span className="text-xs font-semibold text-gray-700 hidden sm:inline max-w-[120px] truncate">
                    {user.fullName || user.email}
                  </span>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50">
                  {user && (
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-bold text-gray-800 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">
                        {user.role}
                      </span>
                    </div>
                  )}
                  {user?.role === 'FREELANCER' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate(PATH_FREELANCER_CREATE_PROFILE);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium cursor-pointer border-0 bg-transparent transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Hồ sơ của tôi
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold cursor-pointer border-0 bg-transparent transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => navigate(PATH_LOGIN)}
              className="text-sm font-semibold text-gray-600 hover:text-[#0047FF] cursor-pointer bg-transparent border-0 p-0 hidden md:block"
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => navigate(PATH_REGISTER, { state: { accountType: 'FREELANCER' } })}
              className="bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] hover:opacity-90 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md transition-opacity cursor-pointer border-0"
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Hamburger Menu Button (Mobile Only) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-gray-500 hover:text-[#1D4ED8] transition-colors p-1"
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
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-white border-b border-gray-100 shadow-lg flex flex-col p-4 gap-2">
          {isAuthenticated && user ? (
            <>
              <div className="px-2 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-bold text-gray-800">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              {user?.role === 'FREELANCER' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(PATH_FREELANCER_CREATE_PROFILE);
                  }}
                  className={getNavClass(PATH_FREELANCER_CREATE_PROFILE)}
                >
                  Hồ sơ của tôi
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(PATH_FREELANCER_JOBS);
                }}
                className={getNavClass(PATH_FREELANCER_JOBS)}
              >
                Tìm việc
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(PATH_FREELANCER_APPLICATIONS);
                }}
                className={getNavClass(PATH_FREELANCER_APPLICATIONS)}
              >
                Chờ phản hồi
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(PATH_WORKSPACES, { state: { role: 'freelancer' } });
                }}
                className={getNavClass('/workspace')}
              >
                Tin nhắn
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(PATH_FREELANCER_PROJECTS);
                }}
                className={getNavClass(PATH_FREELANCER_PROJECTS)}
              >
                Dự án của tôi
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(PATH_FREELANCER_EARNINGS);
                }}
                className={getNavClass(PATH_FREELANCER_EARNINGS)}
              >
                Thu nhập
              </button>
              <hr className="border-gray-100 my-1" />
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold cursor-pointer border-0 bg-transparent transition-colors rounded-lg"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(PATH_HOME);
                }}
                className={getNavClass(PATH_HOME)}
              >
                Khách hàng
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(PATH_FREELANCER);
                }}
                className={getNavClass(PATH_FREELANCER)}
              >
                Freelancer
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(PATH_FREELANCER_PRICING);
                }}
                className={getNavClass(PATH_FREELANCER_PRICING)}
              >
                Dịch vụ
              </button>
              <hr className="border-gray-100 my-1" />
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(PATH_LOGIN);
                }}
                className="w-full text-center text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 px-6 py-3 rounded-xl cursor-pointer transition-colors"
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(PATH_REGISTER, { state: { accountType: 'FREELANCER' } });
                }}
                className="w-full text-center text-sm font-bold text-white bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] px-6 py-3 rounded-xl cursor-pointer transition-opacity"
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
