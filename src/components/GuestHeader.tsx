import type React from 'react';
import { Link } from 'react-router-dom';
import * as paths from '../routes/paths';
const GuestHeader: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 md:px-10 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-10">
        {/* Logo */}
        <Link
          to={paths.PATH_HOME}
          className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0047FF] to-[#00B2FF] cursor-pointer"
          style={{ fontFamily: "'Quedora', sans-serif" }}
        >
          SAM
        </Link>

        {/* Navigation Center */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            type="button"
            className="text-sm font-semibold text-gray-600 hover:text-[#0047FF] cursor-pointer bg-transparent border-0 p-0"
          >
            Khách hàng
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-gray-600 hover:text-[#0047FF] cursor-pointer bg-transparent border-0 p-0"
          >
            Freelancer
          </button>
          <button
            type="button"
            className="text-sm font-bold bg-[#EEF2FF] text-[#1D4ED8] px-4 py-1.5 rounded-full cursor-pointer border-0 hover:bg-[#E0E7FF] transition-colors"
          >
            Gói dịch vụ
          </button>
        </nav>
      </div>

      {/* Navigation Right */}
      <div className="flex items-center gap-6">
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
    </header>
  );
};

export default GuestHeader;
