import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../api/job';
import { profileApi } from '../api/profile';
import InteractiveBackground from '../components/landing/InteractiveBackground';
import { MonoTag, PrimaryButton, SecondaryButton } from '../components/landing/LandingButtons';
import LandingFooter from '../components/landing/LandingFooter';
import LandingNavbar from '../components/landing/LandingNavbar';
import ScrollReveal from '../components/landing/ScrollReveal';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';
import type { FreelancerProfileResponse } from '../types/profile';

const formatBudget = (min?: number | null, max?: number | null): string => {
  if (!min && !max) return 'Thỏa thuận';
  const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) {
    if (min === max) return fmt(min);
    return `${fmt(min)} - ${fmt(max)}`;
  }
  if (min) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max!)}`;
};

const FreelancerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [profile, setProfile] = useState<FreelancerProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const { data: openJobs = [] } = useQuery({
    queryKey: ['open-jobs'],
    queryFn: () => jobApi.getAllOpenJobs(),
    staleTime: 60_000,
  });

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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col relative selection:bg-[#1D4ED8]/10 selection:text-[#1D4ED8]">
      {/* Background Matrix Canvas */}
      <InteractiveBackground />

      {/* Morphing Sticky Navbar */}
      <LandingNavbar />

      {/* ================= HERO SECTION ================= */}
      <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16 lg:pb-24 flex flex-col items-start text-left relative z-10">
        {/* LOGGED IN FREELANCER HERO */}
        {isAuthenticated && user?.role === 'FREELANCER' ? (
          <div className="w-full space-y-6">
            <div className="space-y-3 mb-6">
              <MonoTag variant="primary">KHÔNG GIAN LÀM VIỆC {'//'} FREELANCER</MonoTag>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Chào mừng trở lại,{' '}
                <span className="text-[#1D4ED8]">{user.fullName || 'Freelancer'}</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Hệ thống AI Matching liên tục phân tích hồ sơ để đề xuất các cơ hội việc làm tốt
                nhất cho bạn.
              </p>
            </div>

            {/* Profile Card View */}
            {isLoadingProfile ? (
              <div className="bg-white rounded-[12px] p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-500 font-mono">
                  Đang tải thông tin hồ sơ của bạn...
                </span>
              </div>
            ) : hasProfile && profile ? (
              <div className="bg-white rounded-[12px] p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-left space-y-6">
                {/* Profile Header Info */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[8px] bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm shrink-0">
                      {(profile.fullName || user.fullName || 'FL').charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                          {profile.fullName || user.fullName}
                        </h2>
                        <MonoTag variant="success">ĐÃ XÁC THỰC</MonoTag>
                      </div>
                      <p className="text-sm font-semibold text-[#1D4ED8]">
                        {profile.headline || 'Chưa cập nhật tiêu đề nghề nghiệp'}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {profile.email || user.email}
                      </p>
                    </div>
                  </div>

                  {/* Hourly Rate Box */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-[8px] px-5 py-3 w-full sm:w-auto text-left sm:text-right">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 font-mono">
                      Mức giá theo giờ
                    </span>
                    <span className="text-lg font-black text-[#1D4ED8] font-mono">
                      {profile.hourlyRate
                        ? `${Number(profile.hourlyRate).toLocaleString('vi-VN')} VNĐ / giờ`
                        : 'Chưa đặt mức giá'}
                    </span>
                  </div>
                </div>

                {/* Bio Section */}
                {profile.bio && (
                  <div className="pb-4 border-b border-slate-100">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Giới thiệu bản thân
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Skills tags */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="pb-4 border-b border-slate-100">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
                      Kỹ năng chuyên môn ({profile.skills.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <div
                          key={skill.skillId || skill.skillName}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-[#1D4ED8]/[0.05] border border-slate-200 hover:border-[#1D4ED8]/30 rounded-[6px] text-xs font-medium text-slate-700 transition-colors font-mono"
                        >
                          <span className="font-semibold">{skill.skillName}</span>
                          <span className="text-[10px] text-slate-400">
                            • {skill.yearsOfExperience} năm
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Action Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Hồ sơ đã sẵn sàng nhận dự án</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <SecondaryButton
                      onClick={() => navigate(paths.PATH_FREELANCER_CREATE_PROFILE)}
                      className="flex-1 sm:flex-initial"
                    >
                      Chỉnh sửa hồ sơ
                    </SecondaryButton>
                    <PrimaryButton
                      onClick={() => navigate(paths.PATH_FREELANCER_JOBS)}
                      className="flex-1 sm:flex-initial"
                    >
                      Tìm việc phù hợp
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            ) : (
              /* Profile not completed banner */
              <div className="bg-white rounded-[12px] p-6 sm:p-8 text-center max-w-xl border border-amber-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="mb-3">
                  <MonoTag variant="muted">HỒ SƠ CHƯA HOÀN THIỆN</MonoTag>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Cập nhật hồ sơ để nhận đề xuất AI
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                  Hãy cập nhật thông tin nghề nghiệp, kỹ năng và mức giá của bạn để hệ thống AI
                  Matching bắt đầu đề xuất các công việc phù hợp nhất.
                </p>
                <PrimaryButton onClick={() => navigate(paths.PATH_FREELANCER_CREATE_PROFILE)}>
                  Tạo và hoàn thiện hồ sơ ngay
                </PrimaryButton>
              </div>
            )}
          </div>
        ) : (
          /* GUEST HERO */
          <div className="w-full">
            <div className="mb-4">
              <MonoTag variant="primary">NỀN TẢNG FREELANCE AI {'//'} CƠ HỘI NGHỀ NGHIỆP</MonoTag>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-slate-900 leading-[1.18] tracking-tight mb-5 max-w-3xl">
              Nơi kết nối công việc <br />
              <span className="text-[#1D4ED8]">mơ ước</span> của bạn
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-2xl leading-relaxed">
              Trải nghiệm nền tảng tuyển dụng thông minh được vận hành bởi AI, giúp bạn tìm thấy cơ
              hội phù hợp nhất với kỹ năng và đam mê.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <PrimaryButton
                onClick={() =>
                  navigate(paths.PATH_REGISTER, { state: { accountType: 'FREELANCER' } })
                }
              >
                Đăng ký Freelancer ngay
              </PrimaryButton>
              <SecondaryButton onClick={() => navigate(paths.PATH_LOGIN)}>
                Đăng nhập
              </SecondaryButton>
            </div>
          </div>
        )}
      </section>

      {/* ================= JOBS LISTING ================= */}
      <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="mb-2">
              <MonoTag variant="muted">THỊ TRƯỜNG VIỆC LÀM {'//'} REALTIME JOBS</MonoTag>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Công việc hiện có
            </h2>
            <p className="text-slate-600 text-sm">Khám phá hàng ngàn cơ hội mới mỗi ngày</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['Tất cả', 'Lập trình', 'Thiết kế', 'Viết lách'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-4 py-2 rounded-[6px] text-xs font-mono font-medium transition-colors cursor-pointer border ${
                  activeFilter === filter
                    ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {openJobs.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 font-mono text-xs">
              Hiện chưa có dự án nào đang mở tuyển.
            </div>
          ) : (
            openJobs.slice(0, 4).map((job, idx) => (
              <ScrollReveal key={job.id} delayMs={idx * 60} className="h-full">
                <div className="group h-full bg-white rounded-[12px] p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <MonoTag variant="primary">
                        {job.status === 'OPEN' ? '🟢 ĐANG MỞ' : job.status}
                      </MonoTag>
                      <span className="font-mono text-[10px] text-slate-400">AI MATCHED</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-3 line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-4 font-mono">
                      <span className="text-xs text-slate-400">NGÂN SÁCH:</span>
                      <span className="text-sm font-bold text-[#1D4ED8]">
                        {formatBudget(job.budgetMin, job.budgetMax)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {job.skills?.slice(0, 4).map((skill) => (
                        <span
                          key={skill.id}
                          className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-[4px]"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <SecondaryButton
                    onClick={() => navigate(paths.PATH_JOB_DETAIL.replace(':id', job.id))}
                    size="sm"
                    withArrow
                    className="w-full mt-auto"
                  >
                    Xem chi tiết
                  </SecondaryButton>
                </div>
              </ScrollReveal>
            ))
          )}
        </div>
      </section>

      {/* ================= GUIDE / BANNER ================= */}
      <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-12 relative z-10">
        <ScrollReveal>
          <div className="bg-white rounded-[12px] p-8 sm:p-12 lg:p-14 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 flex flex-col items-start">
              <div className="mb-3">
                <MonoTag variant="primary">QUY TRÌNH {'//'} 3 BƯỚC KHỞI ĐẦU</MonoTag>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4">
                Sẵn sàng để tỏa sáng?
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 max-w-md">
                Chỉ với 3 bước đơn giản, bạn sẽ gia nhập cộng đồng hơn 50.000 freelancer tài năng
                nhất Việt Nam. Hệ thống AI của chúng tôi sẽ tự động đề xuất công việc dựa trên
                Portfolio của bạn.
              </p>

              <div className="flex flex-col gap-3.5 mb-8 w-full max-w-md">
                {[
                  'Hoàn thiện hồ sơ chuyên nghiệp',
                  'Nhận đề xuất việc làm từ AI',
                  'Bắt đầu làm việc & Nhận thanh toán',
                ].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="w-6 h-6 shrink-0 rounded-[6px] bg-[#1D4ED8] flex items-center justify-center text-white font-mono font-bold text-xs">
                      {index + 1}
                    </span>
                    <span className="text-slate-800 text-xs sm:text-sm font-medium">{step}</span>
                  </div>
                ))}
              </div>

              <PrimaryButton onClick={() => navigate(paths.PATH_FREELANCER_JOBS)}>
                Bắt đầu công việc
              </PrimaryButton>
            </div>

            {/* Video preview container */}
            <div className="flex-1 w-full relative rounded-[8px] overflow-hidden border border-slate-200 shadow-sm group cursor-pointer bg-slate-900 aspect-[16/10]">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
                alt="Video Thumbnail"
                className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity"
              />

              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <div className="w-12 h-12 rounded-[8px] bg-white text-[#1D4ED8] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                <div>
                  <span className="text-white/70 font-mono text-[10px] tracking-widest uppercase mb-0.5 block">
                    HƯỚNG DẪN {'//'} ONBOARDING
                  </span>
                  <span className="text-white font-bold text-sm">Cách hoạt động của SAM</span>
                </div>
                <span className="bg-slate-900/80 text-white font-mono text-[10px] px-2 py-0.5 rounded-[4px] border border-slate-700">
                  02:45
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer đồng nhất */}
      <LandingFooter />
    </div>
  );
};

export default FreelancerPage;
