import type React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import * as paths from '../routes/paths';
import { MOCK_JOBS } from './FreelancerJobsPage';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Use first job as fallback if not found
  const job = MOCK_JOBS.find((j) => j.id.toString() === id) || MOCK_JOBS[0];

  const savedApplications = JSON.parse(localStorage.getItem('SAM_FREELANCER_APPLICATIONS') || '[]');
  const existingApplication = savedApplications.find(
    (app: any) => app.jobId.toString() === job.id.toString()
  );

  const getButtonText = () => {
    if (!existingApplication) return 'Kết Nối Công Việc';
    switch (existingApplication.status) {
      case 'pending':
        return 'Đang chờ phản hồi';
      case 'draft':
        return 'Tiếp tục ứng tuyển';
      case 'approved':
        return 'Đã được duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return 'Kết Nối Công Việc';
    }
  };

  const getButtonClass = () => {
    const baseClass = 'font-bold px-10 py-4 rounded-full transition-shadow text-lg border-0 ';
    if (!existingApplication || existingApplication.status === 'draft') {
      return `${baseClass}bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:shadow-lg text-white cursor-pointer`;
    }
    return `${baseClass}bg-gray-200 text-gray-500 cursor-not-allowed`;
  };

  const handleApplyClick = () => {
    if (!existingApplication || existingApplication.status === 'draft') {
      navigate(paths.PATH_JOB_APPLY.replace(':id', job.id.toString()));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1D4ED8] mb-6 font-semibold transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ================= CỘT TRÁI ================= */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-4">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-8">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold text-[#1D4ED8] bg-[#EEF2FF] px-3 py-1.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-3">Mô tả dự án</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {job.description || 'Đang cập nhật mô tả...'}
              </p>

              <h2 className="text-lg font-bold text-gray-900 mb-3">Phạm vi công việc:</h2>
              <ul className="list-disc pl-5 text-gray-600 text-sm leading-relaxed mb-10 space-y-2">
                {(job.scope || []).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <button type="button" onClick={handleApplyClick} className={getButtonClass()}>
                {getButtonText()}
              </button>
            </section>

            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-[#1D4ED8] rounded-full" />
                Yêu cầu chi tiết
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#F8FAFC] p-4 rounded-2xl flex flex-col items-start gap-2 border border-gray-100">
                  <svg
                    className="w-5 h-5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Time"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Thời hạn
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {job.duration || 'Thỏa thuận'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-2xl flex flex-col items-start gap-2 border border-gray-100">
                  <svg
                    className="w-5 h-5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Skills"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Kỹ năng
                  </span>
                  <span className="text-sm font-bold text-gray-900">{job.tags?.join(', ')}</span>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-2xl flex flex-col items-start gap-2 border border-gray-100">
                  <svg
                    className="w-5 h-5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Level"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Cấp độ
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {job.experience || 'Tùy chọn'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-2xl flex flex-col items-start gap-2 border border-gray-100">
                  <svg
                    className="w-5 h-5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Language"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Ngôn ngữ
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {job.languages || 'Tiếng Việt'}
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Các công việc tương tự</h2>
                <button
                  type="button"
                  className="text-sm font-bold text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0"
                >
                  Xem tất cả →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-shadow bg-white flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-white bg-[#0047FF] px-2.5 py-1 rounded">
                      MỚI ĐĂNG
                    </span>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        role="img"
                        aria-label="Bookmark"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug mb-3">
                    Kỹ sư Computer Vision cho Hệ thống An ninh
                  </h3>
                  <div className="flex gap-2 mb-6">
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      OpenCV
                    </span>
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      C++
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-base font-bold text-[#1D4ED8]">₫35,000,000</span>
                    <button
                      type="button"
                      className="text-xs font-bold text-[#1D4ED8] bg-[#EEF2FF] px-4 py-2 rounded-lg cursor-pointer border-0 hover:bg-[#E0E7FF] transition-colors"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-shadow bg-white flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-white bg-[#0047FF] px-2.5 py-1 rounded">
                      MỚI ĐĂNG
                    </span>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        role="img"
                        aria-label="Bookmark"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug mb-3">
                    Chuyên gia AI tạo hình & Stable Diffusion
                  </h3>
                  <div className="flex gap-2 mb-6">
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Stable Diffusion
                    </span>
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Midjourney
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-base font-bold text-[#1D4ED8]">₫30,000,000</span>
                    <button
                      type="button"
                      className="text-xs font-bold text-[#1D4ED8] bg-[#EEF2FF] px-4 py-2 rounded-lg cursor-pointer border-0 hover:bg-[#E0E7FF] transition-colors"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="w-full rounded-3xl bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="md:w-1/2">
                <h3 className="text-xl font-bold mb-2">Thông tin về SAM</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Hệ sinh thái AI Matching hàng đầu Đông Nam Á, kết nối tài năng công nghệ với những
                  dự án tương lai.
                </p>
              </div>
              <div className="md:w-1/2 flex justify-between w-full">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black">4.8</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
                    Sao đánh giá
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black">#1</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
                    Nền tảng
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black">2M+</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
                    Truy cập
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black">$15M</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
                    Đã chi trả
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CỘT PHẢI ================= */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <section className="bg-[#EEF2FF] rounded-3xl p-6 border border-[#E0E7FF]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Thông dự án
                </span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="bg-[#1D4ED8] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">
                  Đang mở
                </span>
                <span className="text-xs font-semibold text-gray-500">MÃ: MAI-2045</span>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#1D4ED8]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Wallet"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Ngân sách
                    </div>
                    <div className="text-xl font-black text-[#1D4ED8]">{job.price}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-gray-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Payment type"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Thanh toán
                    </div>
                    <div className="text-sm font-bold text-gray-900">Theo cột mốc (Milestones)</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-gray-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Remote work"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Hình thức làm việc
                    </div>
                    <div className="text-sm font-bold text-gray-900">Làm việc từ xa (Remote)</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-6">
                Thông tin khách hàng
              </span>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">
                    LOGO
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    TechFlow Solutions
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <svg
                      className="w-3.5 h-3.5 text-[#00B2FF]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label="Star"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="text-xs font-bold text-gray-900">4.9</span>
                    <span className="text-[11px] text-gray-400">(42)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-6 border-t border-gray-100 pt-5">
                <div className="flex items-center gap-3 text-gray-600 text-xs">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Location"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Hồ Chí Minh, Việt Nam</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-xs">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Join date"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Đã tham gia vào 15/05/2023</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-xs">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Job count"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>24 công việc đã đăng</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full bg-[#0AAAD7] hover:bg-[#0896BD] text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Message"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Liên hệ khách hàng
              </button>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetailPage;
