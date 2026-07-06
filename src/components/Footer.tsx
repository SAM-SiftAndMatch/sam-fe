import type React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-100 pt-16 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Phần nội dung chính chia cột */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Cột 1: Logo & Thông tin */}
          <div className="flex flex-col items-start col-span-1">
            <span
              className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0047FF] to-[#00B2FF] mb-4"
              style={{ fontFamily: "'Quedora', sans-serif" }}
            >
              SAM
            </span>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Nền tảng kết nối nhân tài hàng đầu
              <br />
              Việt Nam ứng dụng trí tuệ nhân tạo.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-gray-700 hover:bg-[#E2E8F0] hover:text-[#0047FF] transition-colors cursor-pointer border-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  role="img"
                  aria-label="Website"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.954 11.954 0 0112 15.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0112 21M3 12c0-.778.099-1.533.284-2.253m0 0A8.959 8.959 0 013 12c0 1.61.417 3.129 1.157 4.453"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-gray-700 hover:bg-[#E2E8F0] hover:text-[#0047FF] transition-colors cursor-pointer border-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  role="img"
                  aria-label="Email"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Cột 2: Dành cho Khách hàng */}
          <div className="flex flex-col items-start col-span-1">
            <h3 className="text-gray-900 font-bold mb-5">Dành cho Khách hàng</h3>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="text-gray-500 hover:text-[#0047FF] text-sm text-left transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Thuê Freelancer
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-[#0047FF] text-sm text-left transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Đăng dự án
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-[#0047FF] text-sm text-left transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Hồ sơ năng lực
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-[#0047FF] text-sm text-left transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Giải pháp AI
              </button>
            </div>
          </div>

          {/* Cột 3: Về chúng tôi */}
          <div className="flex flex-col items-start col-span-1">
            <h3 className="text-gray-900 font-bold mb-5">Về chúng tôi</h3>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="text-gray-500 hover:text-[#0047FF] text-sm text-left transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Về chúng tôi
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-[#0047FF] text-sm text-left transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Blog
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-[#0047FF] text-sm text-left transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Liên hệ
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-[#0047FF] text-sm text-left transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Tìm việc
              </button>
            </div>
          </div>

          {/* Cột 4: Chính sách */}
          <div className="flex flex-col items-start col-span-1">
            <h3 className="text-gray-900 font-bold mb-5">Chính sách</h3>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="text-gray-500 hover:text-[#0047FF] text-sm text-left transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Điều khoản
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-[#0047FF] text-sm text-left transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Chính sách bảo mật
              </button>
            </div>
          </div>
        </div>

        {/* Phần Copyright dưới cùng */}
        <div className="text-center pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 font-medium">
            © 2026 SAM AI Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
