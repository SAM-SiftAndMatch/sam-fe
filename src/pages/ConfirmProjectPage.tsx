import type React from 'react';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';

const ConfirmProjectPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <ClientDashboardHeader />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-100 w-full max-w-lg flex flex-col items-center text-center">
          {/* Icon Question */}
          <div className="w-20 h-20 rounded-full bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center mb-6 shadow-inner">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              role="img"
              aria-label="Question"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Bạn có chắc chắn muốn đăng dự án này?
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 px-4">
            Sau khi đăng, dự án sẽ được hiển thị cho freelancer trên nền tảng. Bạn có thể chỉnh sửa
            lại sau trong quản lý dự án.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 w-full mb-8">
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                role="img"
                aria-label="Back"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Quay lại
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold hover:opacity-90 shadow-md transition-opacity cursor-pointer text-sm border-0"
            >
              Xác nhận đăng dự án
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                role="img"
                aria-label="Rocket"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 10.5L21 3m-7.5 7.5L8.25 15.75m5.25-5.25v6.75a1.5 1.5 0 01-2.483 1.13L8.25 15.75m5.25-5.25H6.75a1.5 1.5 0 01-1.13-2.483L10.5 8.25M13.5 10.5L8.25 15.75m0 0L3 21"
                />
              </svg>
            </button>
          </div>

          {/* Project Preview */}
          <div className="w-full flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
            <img
              src="https://images.unsplash.com/photo-1616077168079-7e09a6a71bb2?auto=format&fit=crop&w=100&q=80"
              alt="Preview"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="text-left">
              <span className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-widest block mb-0.5">
                DỰ ÁN
              </span>
              <span className="text-sm font-bold text-gray-900 leading-tight">
                Thiết kế UI/UX App Fintech & AI Integration
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConfirmProjectPage;
