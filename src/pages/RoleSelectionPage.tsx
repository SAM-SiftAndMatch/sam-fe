import type React from 'react';
import Footer from '../components/Footer';
import GuestHeader from '../components/GuestHeader';

const RoleSelectionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* Gọi Header Dành cho khách */}
      <GuestHeader />

      {/* Nội dung chính căn giữa */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center">
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-[44px] font-bold text-gray-900 mb-4 tracking-tight">
            Bạn là ai?
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
            Hãy chọn vai trò phù hợp để chúng tôi tối ưu hóa trải nghiệm của bạn trên nền tảng SAM
          </p>
        </div>

        {/* Khung chọn vai trò */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
          {/* Card Khách Hàng */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-xl transition-shadow flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Briefcase"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Tôi là Khách hàng</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow px-2">
              Đăng dự án, tìm freelancer nhanh chóng và an tâm với quy trình bảo mật tuyệt đối
            </p>
            <button
              type="button"
              className="w-full bg-[#1D4ED8] hover:bg-[#153bb5] text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer border-0 mb-4 shadow-md"
            >
              Tiếp tục với tư cách Khách hàng
            </button>
            <button
              type="button"
              className="text-sm font-bold text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0 p-0 flex items-center gap-1"
            >
              Xem Gói Dịch Vụ
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Arrow Right"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                />
              </svg>
            </button>
          </div>

          {/* Card Freelancer */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-xl transition-shadow flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Rocket"
              >
                <path
                  fillRule="evenodd"
                  d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Tôi là Freelancer</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow px-2">
              Tự động hóa việc tìm job, tối ưu hóa thu nhập mà không phải bào mòn công sức
            </p>
            <button
              type="button"
              className="w-full bg-[#0AAAD7] hover:bg-[#0896BD] text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer border-0 mb-4 shadow-md"
            >
              Tiếp tục với tư cách Freelancer
            </button>
            <button
              type="button"
              className="text-sm font-bold text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0 p-0 flex items-center gap-1"
            >
              Xem Gói Dịch Vụ
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Arrow Right"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Link chuyển trang */}
        <div className="text-center text-sm text-gray-600">
          Bạn đã có tài khoản?{' '}
          <button
            type="button"
            className="text-[#1D4ED8] font-bold hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            Đăng nhập ngay
          </button>
        </div>
      </main>

      {/* Gọi Component Footer chung */}
      <Footer />
    </div>
  );
};

export default RoleSelectionPage;
