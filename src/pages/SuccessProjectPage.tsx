import type React from 'react';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';

const SuccessProjectPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <ClientDashboardHeader />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-100 w-full max-w-lg flex flex-col items-center text-center">
          {/* Icon Success */}
          <div className="w-20 h-20 rounded-full bg-cyan-50 text-[#0AAAD7] border-4 border-cyan-100 flex items-center justify-center mb-6 shadow-inner">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              role="img"
              aria-label="Success"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-[#0AAAD7] mb-3">Dự án đã được đăng thành công</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Freelancer sẽ sớm gửi đề xuất cho dự án của bạn
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            <div className="bg-[#F8FAFC] rounded-xl p-3 flex flex-col items-start border border-gray-100">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                MÃ DỰ ÁN
              </span>
              <span className="text-xs font-bold text-[#1D4ED8]">ID_SAM2024</span>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 flex flex-col items-start border border-gray-100">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                NGÀY ĐĂNG
              </span>
              <span className="text-xs font-bold text-gray-900">24/10/2023</span>
            </div>
            <div className="bg-[#EEF2FF] rounded-xl p-3 flex flex-col items-start border border-[#DCE4FF]">
              <span className="text-[9px] font-bold text-[#1D4ED8] uppercase tracking-widest mb-1">
                TRẠNG THÁI
              </span>
              <span className="text-xs font-bold text-[#1D4ED8] flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] animate-pulse" />
                Đang nhận đề xuất
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex w-full gap-3">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1D4ED8] hover:bg-[#153bb5] text-white font-bold transition-colors cursor-pointer text-sm border-0 shadow-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                role="img"
                aria-label="View"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Xem dự án
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed border-[#1D4ED8] text-[#1D4ED8] font-bold hover:bg-[#EEF2FF] transition-colors cursor-pointer text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                role="img"
                aria-label="Dashboard"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Về trang tổng quan
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SuccessProjectPage;
