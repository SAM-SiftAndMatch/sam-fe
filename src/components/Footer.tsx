import type React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 sm:px-12 py-6 sm:py-8 bg-white gap-4 sm:gap-0 border-t border-slate-200 mt-auto">
      {/* Phần bên trái: Logo và Bản quyền */}
      <div className="flex flex-col gap-1">
        <div
          className="w-fit text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] via-[#0066FF] to-[#0AAAD7] leading-none"
          style={{ fontFamily: "'Quedora', sans-serif" }}
        >
          SAM
        </div>
        <div className="text-slate-500 text-xs font-mono">
          © 2026 SAM AI Marketplace. All rights reserved.
        </div>
      </div>

      {/* Phần bên phải: Các liên kết (Điều khoản, Bảo mật, Trợ giúp) */}
      <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-medium text-slate-500">
        <a href="#" className="transition-colors hover:text-[#1D4ED8]">
          Điều khoản
        </a>
        <a href="#" className="transition-colors hover:text-[#1D4ED8]">
          Bảo mật
        </a>
        <a href="#" className="transition-colors hover:text-[#1D4ED8]">
          Trợ giúp
        </a>
      </div>
    </footer>
  );
};

export default Footer;
