import type React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { InteractiveBackground } from '../components/landing/InteractiveBackground';
import { MonoTag } from '../components/landing/LandingButtons';
import { PATH_FREELANCER_APPLICATIONS, PATH_FREELANCER_JOBS } from '../routes/paths';

const SuccessApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDraft = location.state?.isDraft || false;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden">
      <InteractiveBackground />
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4 z-10">
        <div className="bg-white rounded-xl p-8 sm:p-10 shadow-xs border border-slate-200/90 w-full max-w-lg flex flex-col items-center text-center">
          <div className="mb-4">
            <MonoTag variant="primary">
              APPLICATION {'//'} {isDraft ? 'DRAFT_SAVED' : 'SUBMITTED'}
            </MonoTag>
          </div>

          {/* Main Icon Container */}
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-5">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
            {isDraft ? 'Lưu bản nháp thành công' : 'Gửi hồ sơ ứng tuyển thành công'}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-8 max-w-sm">
            {isDraft
              ? 'Hồ sơ ứng tuyển của bạn đã được lưu nháp. Bạn có thể tiếp tục chỉnh sửa và gửi đi bất cứ lúc nào.'
              : 'Hồ sơ của bạn đã được gửi đến khách hàng. Khách hàng sẽ xem xét và phản hồi trong thời gian sớm nhất.'}
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={() => navigate(PATH_FREELANCER_APPLICATIONS)}
              className="group relative w-full h-[44px] bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg border-t border-t-blue-400/30 transition-all duration-200 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] btn-sweep"
            >
              <span>{isDraft ? 'Xem danh sách bản nháp' : 'Xem trạng thái chờ phản hồi'}</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate(PATH_FREELANCER_JOBS)}
              className="w-full h-[44px] bg-white border border-slate-200 text-slate-700 hover:text-[#1D4ED8] hover:border-[#1D4ED8] hover:bg-blue-50/40 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Tiếp tục tìm việc
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SuccessApplicationPage;
