import type React from 'react';
import Footer from '../components/Footer';
import GuestHeader from '../components/GuestHeader';

const FreelancerPricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* 1. Kế thừa Header dành cho khách */}
      <GuestHeader />

      {/* 2. Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center">
        {/* Tiêu đề & Badge */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-full mb-6 shadow-sm">
            <svg
              className="w-3.5 h-3.5 text-[#1D4ED8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              role="img"
              aria-label="Premium Badge"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-widest">
              Premium Freelance Experience
            </span>
          </div>
          <h1 className="text-4xl md:text-[44px] font-bold text-gray-900 mb-4 tracking-tight">
            Nâng tầm sự nghiệp Freelance với AI
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Sở hữu những đặc quyền công nghệ để dẫn đầu thị trường và bảo vệ quyền lợi của bạn trong
            từng dự án.
          </p>
        </div>

        {/* Khung Bảng giá (2 Cột) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-6">
          {/* Gói Basic */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col relative overflow-hidden">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic</h2>
              <p className="text-gray-500 text-xs">Dành cho cá nhân khởi đầu</p>
            </div>

            <div className="flex items-end gap-1 mb-8">
              <span className="text-5xl font-black text-gray-900">0đ</span>
              <span className="text-gray-500 text-sm font-medium mb-1">/tháng</span>
            </div>

            <ul className="flex flex-col gap-4 mb-10 flex-grow">
              <li className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  role="img"
                  aria-label="Check"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700 font-medium">Đăng dự án không giới hạn</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  role="img"
                  aria-label="Check"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700 font-medium">Phí dịch vụ 5%</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  role="img"
                  aria-label="Check"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700 font-medium">Hỗ trợ email</span>
              </li>
            </ul>

            <button
              type="button"
              className="w-full bg-white text-gray-800 font-bold py-3.5 rounded-xl transition-colors cursor-pointer border border-gray-200 hover:bg-gray-50 mt-auto"
            >
              Bắt đầu miễn phí
            </button>
          </div>

          {/* Gói PRO DEV (Upsell) */}
          <div className="bg-gradient-to-br from-[#1D4ED8] to-[#0AAAD7] rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgba(29,78,216,0.2)] flex flex-col relative overflow-hidden transform md:-translate-y-2 border border-blue-400/30">
            {/* Hiệu ứng lấp lánh background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-8 relative z-10">
              <h2 className="text-2xl font-bold text-white mb-2">PRO DEV</h2>
              <p className="text-white/80 text-xs">Gói cao cấp dành cho chuyên gia</p>
            </div>

            <div className="flex items-end gap-1 mb-8 relative z-10">
              <span className="text-5xl font-black text-white">149.000đ</span>
              <span className="text-white/80 text-sm font-medium mb-1">/tháng</span>
            </div>

            <ul className="flex flex-col gap-4 mb-10 flex-grow relative z-10">
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-white font-bold">Nhận việc 1 chạm</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-white font-bold leading-snug">
                  Thông báo độc quyền trước 5 phút
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-white font-bold">Lá chắn yêu cầu tự động</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-white font-bold">Hỗ trợ 24/7 qua Hotline</span>
              </li>
            </ul>

            <button
              type="button"
              className="w-full bg-white text-[#1D4ED8] hover:bg-gray-50 font-bold py-3.5 rounded-xl transition-colors cursor-pointer border-0 mt-auto shadow-lg relative z-10"
            >
              Nâng cấp ngay
            </button>
          </div>
        </div>

        {/* Khung Lợi ích bổ sung (2 Cột nhỏ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col items-start">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Lightning"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Tăng tốc thu nhập</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Hệ thống AI giúp bạn tối ưu hóa thời gian tìm kiếm.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col items-start">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Shield"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">An tâm pháp lý</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mọi giao dịch được AI giám sát chặt chẽ.
            </p>
          </div>
        </div>
      </main>

      {/* 3. Kế thừa Footer chung */}
      <Footer />
    </div>
  );
};

export default FreelancerPricingPage;
