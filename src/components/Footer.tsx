import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 sm:px-12 py-6 sm:py-10 bg-white gap-6 sm:gap-0 border-t border-gray-100 mt-auto">
      
      {/* Phần bên trái: Logo và Bản quyền */}
      <div className="flex flex-col gap-2">
        <div className="text-[#0044cc] text-xl font-extrabold tracking-wide">
          SAM
        </div>
        <div className="text-[#888888] text-[13px] font-medium">
          © 2024 SAM AI Marketplace. All rights reserved.
        </div>
      </div>

      {/* Phần bên phải: Các liên kết (Điều khoản, Bảo mật, Trợ giúp) */}
      <div className="flex flex-wrap gap-5 sm:gap-10">
        <a 
          href="#" 
          className="text-[#666666] text-sm font-medium transition-colors duration-200 hover:text-[#0044cc]"
        >
          Điều khoản
        </a>
        <a 
          href="#" 
          className="text-[#666666] text-sm font-medium transition-colors duration-200 hover:text-[#0044cc]"
        >
          Bảo mật
        </a>
        <a 
          href="#" 
          className="text-[#666666] text-sm font-medium transition-colors duration-200 hover:text-[#0044cc]"
        >
          Trợ giúp
        </a>
      </div>
      
    </footer>
  );
};

export default Footer;
