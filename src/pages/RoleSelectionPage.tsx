import type React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GuestHeader from '../components/GuestHeader';
import { InteractiveBackground } from '../components/landing/InteractiveBackground';
import { MonoTag } from '../components/landing/LandingButtons';
import {
  PATH_CLIENT_PRICING,
  PATH_FREELANCER_PRICING,
  PATH_LOGIN,
  PATH_REGISTER,
} from '../routes/paths';

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden">
      {/* Background with dots & cursor repulsion */}
      <InteractiveBackground />

      <GuestHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-3">
            <MonoTag variant="primary">ONBOARDING {'//'} CHỌN VAI TRÒ</MonoTag>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Bạn là ai?
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Hãy chọn vai trò phù hợp để chúng tôi tối ưu hóa trải nghiệm của bạn trên nền tảng SAM
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl mb-12">
          {/* Card Khách Hàng */}
          <div className="bg-white rounded-xl p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#1D4ED8]/60 hover:-translate-y-1 transition-all duration-200 flex flex-col items-start group">
            <div className="w-full flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#1D4ED8] border border-blue-100 flex items-center justify-center transition-transform group-hover:scale-105">
                <svg
                  className="w-6 h-6"
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
              <MonoTag variant="muted">ROLE: CLIENT</MonoTag>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">Tôi là Khách hàng</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Đăng dự án, tìm freelancer nhanh chóng và an tâm với quy trình bảo mật tuyệt đối
            </p>

            {/* Micro value snippets */}
            <div className="w-full space-y-2 mb-8 text-xs text-slate-600 font-mono bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[#1D4ED8] font-bold">✓</span>
                <span>Tự động chuẩn hóa PRD với AI PM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#1D4ED8] font-bold">✓</span>
                <span>Ghép đúng top freelancer trong 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#1D4ED8] font-bold">✓</span>
                <span>Kiểm định mã nguồn với AI QC & Escrow</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigate(PATH_REGISTER, { state: { accountType: 'CLIENT' } });
              }}
              className="group/btn relative w-full h-[44px] bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg border-t border-t-blue-400/30 transition-all duration-200 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] btn-sweep mb-3"
            >
              <span>Tiếp tục với tư cách Khách hàng</span>
              <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate(PATH_CLIENT_PRICING)}
              className="w-full text-center text-xs font-mono font-medium text-slate-500 hover:text-[#1D4ED8] transition-colors cursor-pointer py-1"
            >
              XEM GÓI DỊCH VỤ →
            </button>
          </div>

          {/* Card Freelancer */}
          <div className="bg-white rounded-xl p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#1D4ED8]/60 hover:-translate-y-1 transition-all duration-200 flex flex-col items-start group">
            <div className="w-full flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#1D4ED8] border border-blue-100 flex items-center justify-center transition-transform group-hover:scale-105">
                <svg
                  className="w-6 h-6"
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
              <MonoTag variant="muted">ROLE: FREELANCER</MonoTag>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">Tôi là Freelancer</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Tự động hóa việc tìm job, tối ưu hóa thu nhập mà không phải bào mòn công sức
            </p>

            {/* Micro value snippets */}
            <div className="w-full space-y-2 mb-8 text-xs text-slate-600 font-mono bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[#1D4ED8] font-bold">✓</span>
                <span>Tự động nhận đề xuất job chuẩn tech-stack</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#1D4ED8] font-bold">✓</span>
                <span>Hợp đồng Escrow bảo đảm 100% thù lao</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#1D4ED8] font-bold">✓</span>
                <span>AI hỗ trợ rà soát mã nguồn & tiêu chuẩn</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigate(PATH_REGISTER, { state: { accountType: 'FREELANCER' } });
              }}
              className="group/btn relative w-full h-[44px] bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg border-t border-t-blue-400/30 transition-all duration-200 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] btn-sweep mb-3"
            >
              <span>Tiếp tục với tư cách Freelancer</span>
              <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate(PATH_FREELANCER_PRICING)}
              className="w-full text-center text-xs font-mono font-medium text-slate-500 hover:text-[#1D4ED8] transition-colors cursor-pointer py-1"
            >
              XEM GÓI DỊCH VỤ →
            </button>
          </div>
        </div>

        {/* Link chuyển trang */}
        <div className="text-center text-xs sm:text-sm text-slate-600">
          Bạn đã có tài khoản?{' '}
          <button
            type="button"
            onClick={() => navigate(PATH_LOGIN)}
            className="text-[#1D4ED8] font-semibold hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            Đăng nhập ngay
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoleSelectionPage;
