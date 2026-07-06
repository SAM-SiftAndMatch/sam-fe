import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PATH_CLIENT_AI_BRIEF,
  PATH_CLIENT_DASHBOARD,
  PATH_CLIENT_FIND_FREELANCER,
  PATH_CLIENT_PROJECTS,
  PATH_LOGIN,
  PATH_WORKSPACES,
} from '../routes/paths';

const ClientDashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNavClass = (path: string) => {
    // Check if the current path starts with the given path (so /workspace/:id also matches /workspaces if we check carefully, but let's just use exact or prefix)
    const isActive = location.pathname.startsWith(path);
    return isActive
      ? 'text-sm font-bold bg-[#EEF2FF] text-[#1D4ED8] px-4 py-1.5 rounded-full cursor-pointer border-0 transition-colors'
      : 'text-sm font-medium text-gray-500 hover:text-[#0047FF] hover:bg-gray-50 px-4 py-1.5 rounded-full cursor-pointer bg-transparent border-0 transition-colors';
  };

  return (
    <header className="w-full py-4 px-6 md:px-10 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
      {/* Logo - Left */}
      <div className="flex-1 flex items-center">
        <span
          onClick={() => navigate(PATH_CLIENT_DASHBOARD)}
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
        <button
          type="button"
          onClick={() => navigate(PATH_CLIENT_PROJECTS)}
          className={getNavClass(PATH_CLIENT_PROJECTS)}
        >
          Dự án
        </button>
        <button
          type="button"
          onClick={() => navigate(PATH_WORKSPACES, { state: { role: 'client' } })}
          className={getNavClass('/workspace')} // Matches /workspaces and /workspace/:id
        >
          Tin nhắn
        </button>
        <button
          type="button"
          onClick={() => navigate(PATH_CLIENT_FIND_FREELANCER)}
          className={getNavClass(PATH_CLIENT_FIND_FREELANCER)}
        >
          Tìm Freelancer
        </button>
      </nav>

      {/* Actions - Right */}
      <div className="flex-1 flex items-center justify-end gap-5">
        <button
          type="button"
          onClick={() => navigate(PATH_CLIENT_AI_BRIEF)}
          className="hidden md:block bg-gradient-to-r from-[#0047FF] to-[#00B2FF] hover:opacity-90 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-sm transition-opacity cursor-pointer border-0"
        >
          Đăng dự án
        </button>
        <button
          type="button"
          className="text-gray-500 hover:text-[#1D4ED8] transition-colors cursor-pointer bg-transparent border-0 p-0"
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
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              role="img"
              aria-label="User Profile"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('SAM_ROLE');
                  navigate(PATH_LOGIN);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold cursor-pointer border-0 bg-transparent transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ClientDashboardHeader;
