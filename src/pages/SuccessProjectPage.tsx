import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { jobApi } from '../api/job';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import JobStatusBadge from '../components/JobStatusBadge';
import { InteractiveBackground } from '../components/landing/InteractiveBackground';
import { PATH_CLIENT_DASHBOARD, PATH_CLIENT_PROJECT_DETAIL } from '../routes/paths';
import type { JobResponse } from '../types/job';

type LocationState = {
  newProjectId?: string;
  jobData?: JobResponse;
  addonPending?: boolean;
  paymentConfirmed?: boolean;
  businessIncluded?: boolean;
};

const SuccessProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = (location.state as LocationState) || {};
  const jobId = state.newProjectId || state.jobData?.id || searchParams.get('jobId') || '';
  const project = useQuery({
    queryKey: ['job-detail', jobId],
    queryFn: () => jobApi.getJobById(jobId),
    enabled: Boolean(jobId),
    initialData: state.jobData,
  });
  const addons = useQuery({
    queryKey: ['job-addons', jobId],
    queryFn: () => jobApi.getAddonSummary(jobId),
    enabled: Boolean(jobId),
  });
  const jobData = project.data;
  const paymentConfirmed = state.paymentConfirmed || addons.data?.orderStatus === 'PAID';
  const addonPending =
    !paymentConfirmed && (state.addonPending || addons.data?.orderStatus === 'PENDING');

  // Format ngày tạo
  const createdDate = jobData?.createdAt
    ? new Date(jobData.createdAt).toLocaleDateString('vi-VN')
    : new Date().toLocaleDateString('vi-VN');

  return (
    <div className="client-route min-h-screen bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden">
      <InteractiveBackground />
      <AppHeader />

      <main className="flex-1 flex items-center justify-center py-16 px-4 z-10">
        <div className="bg-white rounded-xl p-8 sm:p-10 shadow-xs border border-slate-200/90 w-full max-w-lg flex flex-col items-center text-center">
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
          {paymentConfirmed && (
            <p className="mb-6 w-full rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
              Đã thanh toán và kích hoạt các tính năng đã chọn cho dự án.
            </p>
          )}
          {addonPending && (
            <p className="mb-6 w-full rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Dự án đã đăng bình thường. Các tính năng đã chọn chưa được kích hoạt vì chưa thanh
              toán; bạn có thể thanh toán tại trang chi tiết dự án.
            </p>
          )}
          {state.businessIncluded && !addonPending && !paymentConfirmed && (
            <p className="mb-6 text-sm text-blue-700">
              Các tính năng đã chọn được kích hoạt theo gói Business của bạn.
            </p>
          )}

          {/* Tóm tắt dự án: Ngân sách + Thời gian + Kỹ năng */}
          {jobData && (
            <div className="w-full mb-6 space-y-3">
              {/* Ngân sách & thời gian */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 text-left">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">
                    NGÂN SÁCH
                  </span>
                  <span className="text-base font-bold text-[#1D4ED8]">
                    {new Intl.NumberFormat('vi-VN').format(Number(jobData.budgetMin))} đ
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 text-left">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">
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
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">
                    NGÀY ĐĂNG
                  </span>
                  <span className="text-xs font-semibold text-slate-900">{createdDate}</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">
                    TRẠNG THÁI
                  </span>
                  <JobStatusBadge status={jobData.status} />
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
