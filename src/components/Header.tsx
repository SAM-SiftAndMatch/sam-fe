import type React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 md:px-10 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0047FF] to-[#00B2FF] cursor-pointer">
          SAM
        </span>
        <nav className="hidden md:flex items-center gap-6">
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-semibold bg-[#EEF2FF] text-[#0047FF] px-4 py-2 rounded-full cursor-pointer border-0"
          >
            Tìm việc
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              role="img"
              aria-label="Arrow down"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            className="text-sm font-medium text-gray-600 hover:text-[#0047FF] cursor-pointer bg-transparent border-0 p-0"
          >
            Tin nhắn
          </button>
          <button
            type="button"
            className="text-sm font-medium text-gray-600 hover:text-[#0047FF] cursor-pointer bg-transparent border-0 p-0"
          >
            Dự án của tôi
          </button>
          <button
            type="button"
            className="text-sm font-medium text-gray-600 hover:text-[#0047FF] cursor-pointer bg-transparent border-0 p-0"
          >
            Thu nhập
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-5">
        <button
          type="button"
          className="hidden md:block bg-gradient-to-r from-[#0AAAD7] to-[#1D4ED8] hover:opacity-90 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md transition-opacity cursor-pointer border-0"
        >
          Đăng tin tuyển dụng
        </button>
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
        <button
          type="button"
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 cursor-pointer"
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
        </button>
      </div>
    </header>
  );
};

export default Header;
