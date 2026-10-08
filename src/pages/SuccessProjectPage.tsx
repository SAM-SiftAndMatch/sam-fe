import type React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { InteractiveBackground } from '../components/landing/InteractiveBackground';
import { MonoTag } from '../components/landing/LandingButtons';
import { PATH_CLIENT_DASHBOARD, PATH_CLIENT_PROJECT_DETAIL } from '../routes/paths';
import type { JobResponse } from '../types/job';

type LocationState = {
  newProjectId?: string;
  jobData?: JobResponse;
};

const SuccessProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const jobData = state.jobData;
  const jobId = state.newProjectId || jobData?.id || '1';

  // Format ngày tạo
  const createdDate = jobData?.createdAt
    ? new Date(jobData.createdAt).toLocaleDateString('vi-VN')
    : new Date().toLocaleDateString('vi-VN');

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden">
      <InteractiveBackground />
      <ClientDashboardHeader />

      <main className="flex-1 flex items-center justify-center py-16 px-4 z-10">
        <div className="bg-white rounded-xl p-8 sm:p-10 shadow-xs border border-slate-200/90 w-full max-w-lg flex flex-col items-center text-center">
          <div className="mb-4">
            <MonoTag variant="primary">PROJECT {'//'} PUBLISHED</MonoTag>
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
            Dự án đã được đăng thành công
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
            Freelancer sẽ sớm gửi đề xuất cho dự án của bạn
          </p>

          {/* Tóm tắt dự án: Ngân sách + Thời gian + Kỹ năng */}
          {jobData && (
            <div className="w-full mb-6 space-y-3">
              {/* Ngân sách & thời gian */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 text-left">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 block">
                    NGÂN SÁCH
                  </span>
                  <span className="text-base font-bold font-mono text-[#1D4ED8]">
                    {new Intl.NumberFormat('vi-VN').format(Number(jobData.budgetMin))} đ
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 text-left">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 block">
                    THỜI GIAN
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {jobData.estimatedDurationMonths
                      ? `${jobData.estimatedDurationMonths} tháng`
                      : 'Theo thỏa thuận'}
                  </span>
                </div>
              </div>

              {/* Chi tiết thêm */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 block">
                    NGÀY ĐĂNG
                  </span>
                  <span className="text-xs font-semibold text-slate-900">{createdDate}</span>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                  <span className="text-[10px] font-mono text-[#1D4ED8] uppercase tracking-wider mb-1 block">
                    TRẠNG THÁI
                  </span>
                  <span className="text-xs font-bold text-[#1D4ED8] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] animate-pulse" />
                    {jobData.status === 'OPEN' ? 'Đang tuyển' : 'Đang chờ đề xuất'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row w-full gap-3">
            <button
              type="button"
              onClick={() => navigate(PATH_CLIENT_PROJECT_DETAIL.replace(':id', jobId))}
              className="group relative flex-1 h-[44px] bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg border-t border-t-blue-400/30 transition-all duration-200 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] btn-sweep"
            >
              <span>Xem dự án</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate(PATH_CLIENT_DASHBOARD)}
              className="flex-1 h-[44px] bg-white border border-slate-200 text-slate-700 hover:text-[#1D4ED8] hover:border-[#1D4ED8] hover:bg-blue-50/40 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
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
