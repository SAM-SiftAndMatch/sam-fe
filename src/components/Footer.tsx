import type React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 sm:px-12 py-6 sm:py-10 bg-white gap-6 sm:gap-0 border-t border-gray-100 mt-auto">
      {/* Phần bên trái: Logo và Bản quyền */}
      <div className="flex flex-col gap-2">
        <div
          className="w-fit text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7]"
          style={{ fontFamily: "'Quedora', sans-serif" }}
        >
          SAM
        </div>
        <div className="text-gray-500 text-sm font-medium mt-1">
          © 2026 SAM AI Marketplace. All rights reserved.
        </div>
      </div>

      {/* Phần bên phải: Các liên kết (Điều khoản, Bảo mật, Trợ giúp) */}
      <div className="flex flex-wrap gap-5 sm:gap-10">
        <a
          href="#"
          className="text-gray-500 text-sm font-medium transition-colors hover:text-[#1D4ED8]"
        >
          Điều khoản
        </a>
        <a
          href="#"
          className="text-gray-500 text-sm font-medium transition-colors hover:text-[#1D4ED8]"
        >
          Bảo mật
        </a>
        <a
          href="#"
          className="text-gray-500 text-sm font-medium transition-colors hover:text-[#1D4ED8]"
        >
          Trợ giúp
        </a>
      </div>
    </footer>
  );
};

export default Footer;
