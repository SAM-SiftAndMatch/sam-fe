import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/profile';
import FooterDashboard from '../components/FooterDashboard';
import Header from '../components/Header';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';
import type { FreelancerProfileResponse } from '../types/profile';
import { MOCK_JOBS } from './FreelancerJobsPage';

const FreelancerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [profile, setProfile] = useState<FreelancerProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // If a Client lands here, redirect to Client dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'CLIENT') {
      navigate(paths.PATH_CLIENT_DASHBOARD, { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Fetch current freelancer profile if logged in
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && user?.role === 'FREELANCER') {
      setIsLoadingProfile(true);
      profileApi
        .getFreelancerProfile()
        .then((data) => {
          if (isMounted && data) {
            setProfile(data);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch freelancer profile on landing:', err);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingProfile(false);
          }
        });
    } else {
      setIsLoadingProfile(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.role]);

  const hasProfile = Boolean(
    profile &&
      (profile.headline ||
        (profile.skills && profile.skills.length > 0) ||
        (profile.hourlyRate != null && profile.hourlyRate > 0))
  );

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="w-full flex flex-col items-center text-center py-16 md:py-20 px-4 relative overflow-hidden bg-gradient-to-b from-[#F4F7FF] to-white">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#0AAAD7]/20 to-[#1D4ED8]/10 blur-[100px] rounded-full pointer-events-none" />

        {/* LOGGED IN FREELANCER HERO */}
        {isAuthenticated && user?.role === 'FREELANCER' ? (
          <div className="w-full max-w-4xl mx-auto z-10 space-y-6">
            <div className="space-y-2 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/70 text-[#1D4ED8] border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
                Không gian làm việc Freelancer
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                Chào mừng trở lại,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7]">
                  {user.fullName || 'Freelancer'}
                </span>
              </h1>
              <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
                Hệ thống AI Matching liên tục phân tích hồ sơ để đề xuất các cơ hội việc làm tốt
                nhất cho bạn.
              </p>
            </div>

            {/* Profile Card View */}
            {isLoadingProfile ? (
              <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-3 border-[#0047FF] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500 font-medium">
                  Đang tải thông tin hồ sơ của bạn...
                </span>
              </div>
            ) : hasProfile && profile ? (
              <div className="bg-white rounded-[28px] p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left space-y-6">
                {/* Profile Header Info */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#1D4ED8] to-[#00A3FF] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md shrink-0">
                      {(profile.fullName || user.fullName || 'FL').charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {profile.fullName || user.fullName}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">
                          Đã xác thực
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-blue-700">
                        {profile.headline || 'Chưa cập nhật tiêu đề nghề nghiệp'}
                      </p>
                      <p className="text-xs text-gray-400">{profile.email || user.email}</p>
                    </div>
                  </div>

                  {/* Hourly Rate Box */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-2xl px-5 py-3 w-full sm:w-auto text-left sm:text-right">
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                      Mức giá theo giờ
                    </span>
                    <span className="text-lg font-black text-[#1D4ED8]">
                      {profile.hourlyRate
                        ? `${Number(profile.hourlyRate).toLocaleString('vi-VN')} VNĐ / giờ`
                        : 'Chưa đặt mức giá'}
                    </span>
                  </div>
                </div>

                {/* Bio Section */}
                {profile.bio && (
                  <div className="pb-4 border-b border-gray-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Giới thiệu bản thân
                    </span>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Skills tags */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="pb-4 border-b border-gray-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2.5">
                      Kỹ năng chuyên môn ({profile.skills.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <div
                          key={skill.skillId || skill.skillName}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl text-xs font-medium text-gray-700 hover:text-blue-700 transition-colors"
                        >
                          <span className="font-semibold">{skill.skillName}</span>
                          <span className="text-[10px] text-gray-400">
                            • {skill.yearsOfExperience} năm
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Action Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Hồ sơ đã sẵn sàng nhận dự án</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => navigate(paths.PATH_FREELANCER_CREATE_PROFILE)}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 text-gray-700 hover:text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white shadow-xs"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      Chỉnh sửa hồ sơ
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(paths.PATH_FREELANCER_JOBS)}
                      className="flex-1 sm:flex-initial bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:shadow-md text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
                    >
                      Tìm việc phù hợp &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Profile not completed banner */
              <div className="bg-amber-50/90 border border-amber-200 rounded-[28px] p-6 md:p-8 text-center max-w-xl mx-auto shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Hồ sơ của bạn chưa hoàn thiện
                </h3>
                <p className="text-xs text-gray-600 mb-5 max-w-md mx-auto">
                  Hãy cập nhật thông tin nghề nghiệp, kỹ năng và mức giá của bạn để hệ thống AI
                  Matching bắt đầu đề xuất các công việc phù hợp nhất.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(paths.PATH_FREELANCER_CREATE_PROFILE)}
                  className="bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:shadow-md text-white font-bold text-xs px-7 py-3 rounded-full transition-all cursor-pointer border-0 inline-flex items-center gap-2"
                >
                  Tạo và hoàn thiện hồ sơ ngay &rarr;
                </button>
              </div>
            )}
          </div>
        ) : (
          /* GUEST HERO */
          <>
            <h1 className="text-4xl md:text-[56px] font-black text-[#1A1B22] leading-tight mb-6 max-w-3xl z-10">
              Nơi kết nối công việc <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0047FF] to-[#00B2FF] italic pr-2">
                mơ ước
              </span>{' '}
              của bạn
            </h1>
            <p className="text-gray-500 text-base md:text-lg mb-10 max-w-xl z-10 leading-relaxed">
              Trải nghiệm nền tảng tuyển dụng thông minh được vận hành bởi AI, giúp bạn tìm thấy cơ
              hội phù hợp nhất với kỹ năng và đam mê.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 z-10">
              <button
                type="button"
                onClick={() =>
                  navigate(paths.PATH_REGISTER, { state: { accountType: 'FREELANCER' } })
                }
                className="bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:shadow-[0_8px_25px_rgba(0,178,255,0.4)] text-white font-bold px-8 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer border-0 text-sm"
              >
                Đăng ký Freelancer ngay
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Arrow right"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => navigate(paths.PATH_LOGIN)}
                className="bg-white hover:bg-gray-50 text-[#1D4ED8] font-bold px-8 py-3.5 rounded-full border border-gray-200 shadow-sm transition-colors cursor-pointer text-sm"
              >
                Đăng nhập
              </button>
            </div>
          </>
        )}
      </section>

      {/* ================= JOBS LISTING ================= */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Công việc hiện có</h2>
            <p className="text-gray-500 text-sm">Khám phá hàng ngàn cơ hội mới mỗi ngày</p>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['Tất cả', 'Lập trình', 'Thiết kế', 'Viết lách'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer border-0 ${
                  activeFilter === filter
                    ? 'bg-[#1D4ED8] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_JOBS.slice(0, 4).map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow flex flex-col h-full"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-[#0047FF]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Job Icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-gray-500 tracking-wider">
                  {job.type}
                </span>
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 leading-snug mb-3 flex-grow">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 mb-5">
                <svg
                  className="w-4 h-4 text-gray-400"
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
                <span className="text-sm font-bold text-[#1D4ED8]">{job.price}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate(paths.PATH_JOB_DETAIL.replace(':id', job.id.toString()))}
                className="w-full py-3 bg-[#00B2FF] hover:bg-[#009CE0] text-white text-sm font-bold rounded-xl transition-colors mt-auto cursor-pointer border-0"
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================= GUIDE / BANNER ================= */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-10 py-16 mb-10">
        <div className="bg-[#F8FAFC] rounded-[40px] p-8 md:p-14 flex flex-col md:flex-row items-center gap-12 border border-gray-100">
          <div className="flex-1 flex flex-col items-start">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sẵn sàng để tỏa sáng?
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-8 max-w-md">
              Chỉ với 3 bước đơn giản, bạn sẽ gia nhập cộng đồng hơn 50.000 freelancer tài năng nhất
              Việt Nam. Hệ thống AI của chúng tôi sẽ tự động đề xuất công việc dựa trên Portfolio
              của bạn.
            </p>

            <div className="flex flex-col gap-5 mb-10">
              {[
                'Hoàn thiện hồ sơ chuyên nghiệp',
                'Nhận đề xuất việc làm từ AI',
                'Bắt đầu làm việc & Nhận thanh toán',
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-gray-800 font-medium">{step}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate(paths.PATH_FREELANCER_JOBS)}
              className="bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:shadow-lg hover:-translate-y-0.5 text-white font-bold px-8 py-3.5 rounded-full transition-all flex items-center gap-2 cursor-pointer border-0"
            >
              Bắt đầu công việc
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                role="img"
                aria-label="Lightning"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>

          <div className="flex-1 w-full relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors z-10" />
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
              alt="Video Thumbnail"
              className="w-full h-auto aspect-[16/10] object-cover"
            />

            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center">
              <button
                type="button"
                className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform cursor-pointer"
              >
                <svg
                  className="w-8 h-8 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Play"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
              <div>
                <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase mb-1 block">
                  Hướng dẫn
                </span>
                <span className="text-white font-bold text-lg">Cách hoạt động của SAM</span>
              </div>
              <span className="bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                02:45
              </span>
            </div>
          </div>
        </div>
      </section>

      <FooterDashboard />
    </div>
  );
};

export default FreelancerPage;
