import {
  PACKAGE_PRO_DEV_ID,
  useMySubscriptions,
  usePurchasePackage,
} from '@/features/subscription';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveBackground from '../components/landing/InteractiveBackground';
import { MonoTag, PrimaryButton, SecondaryButton } from '../components/landing/LandingButtons';
import LandingFooter from '../components/landing/LandingFooter';
import LandingNavbar from '../components/landing/LandingNavbar';
import ScrollReveal from '../components/landing/ScrollReveal';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

const FreelancerPricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { subscriptions, refetch } = useMySubscriptions();
  const { purchase, purchasingId, error, successMessage } = usePurchasePackage();

  const ownsProDev = subscriptions.some(
    (s) => s.packageId === PACKAGE_PRO_DEV_ID && s.status === 'ACTIVE'
  );

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate(paths.PATH_LOGIN, { state: { returnTo: paths.PATH_FREELANCER_PRICING } });
      return;
    }
    if (user?.role !== 'FREELANCER') {
      navigate(paths.PATH_CLIENT_PRICING);
      return;
    }
    const result = await purchase(PACKAGE_PRO_DEV_ID);
    if (result?.vnpayUrl) {
      localStorage.setItem('SAM_PENDING_SUBSCRIPTION', result.id);
      window.location.href = result.vnpayUrl;
      return;
    }
    if (result) {
      await refetch();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col relative selection:bg-[#1D4ED8]/10 selection:text-[#1D4ED8]">
      {/* Background Matrix Canvas */}
      <InteractiveBackground />

      {/* Morphing Sticky Navbar */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col items-center relative z-10">
        {/* Alerts */}
        {error && (
          <div className="w-full max-w-3xl mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-[8px] font-mono">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="w-full max-w-3xl mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-[8px] font-mono">
            {successMessage}
          </div>
        )}

        {/* Header */}
        <ScrollReveal className="text-center mb-14 max-w-2xl flex flex-col items-center">
          <div className="mb-3">
            <MonoTag variant="primary">FREELANCER SAAS {'//'} PRO TIERS</MonoTag>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Nâng tầm sự nghiệp Freelance với AI
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Sở hữu những đặc quyền công nghệ để dẫn đầu thị trường và bảo vệ quyền lợi của bạn trong
            từng dự án.
          </p>
        </ScrollReveal>

        {/* Khung Bảng giá (2 Cột Đồng Nhất) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12 items-stretch">
          {/* Gói Basic */}
          <ScrollReveal delayMs={0} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <MonoTag variant="muted">PLAN 01 {'//'} BASIC</MonoTag>
                  <span className="font-mono text-xs text-slate-400">MIỄN PHÍ</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Basic</h2>
                <p className="text-xs text-slate-500 mb-6">Dành cho cá nhân khởi đầu</p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                  <span className="font-mono text-4xl sm:text-5xl font-black text-slate-900 leading-none">
                    0đ
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/tháng</span>
                </div>

                <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                    <span>Đăng dự án không giới hạn</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                    <span>Phí dịch vụ 5%</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                    <span>Hỗ trợ email</span>
                  </li>
                </ul>
              </div>

              <SecondaryButton
                onClick={() => navigate(paths.PATH_REGISTER)}
                className="w-full mt-auto"
              >
                Bắt đầu miễn phí
              </SecondaryButton>
            </div>
          </ScrollReveal>

          {/* Gói PRO DEV (Upsell) */}
          <ScrollReveal delayMs={100} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-8 border-2 border-[#1D4ED8] shadow-[0_4px_20px_rgba(29,78,216,0.08)] hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 right-6">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-[#1D4ED8] text-white px-3 py-1 rounded-[6px] shadow-sm">
                  ĐẶC QUYỀN AI
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <MonoTag variant="primary">PLAN 02 {'//'} PRO DEV</MonoTag>
                  <span className="font-mono text-xs text-[#1D4ED8] font-bold">KHUYÊN DÙNG</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">PRO DEV</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Nhận việc 1 chạm + lá chắn Scope Shield, hiệu lực 30 ngày
                </p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                  <span className="font-mono text-4xl sm:text-5xl font-black text-[#1D4ED8] leading-none">
                    149.000đ
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/tháng</span>
                </div>

                <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-800">
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                    <span>Nhận việc 1 chạm, không cần đấu thầu</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                    <span>Thông báo độc quyền trước 5 phút</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                    <span>Lá chắn yêu cầu tự động (Scope Shield)</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                    <span>Hỗ trợ 24/7 qua Hotline</span>
                  </li>
                </ul>
              </div>

              {ownsProDev ? (
                <button
                  type="button"
                  disabled
                  className="w-full h-[44px] bg-slate-100 text-slate-500 text-sm font-medium rounded-[8px] cursor-default border border-slate-200 mt-auto"
                >
                  Đang sử dụng
                </button>
              ) : (
                <PrimaryButton
                  onClick={() => void handlePurchase()}
                  disabled={purchasingId === PACKAGE_PRO_DEV_ID}
                  className="w-full mt-auto"
                >
                  {purchasingId === PACKAGE_PRO_DEV_ID ? 'Đang xử lý...' : 'Nâng cấp ngay'}
                </PrimaryButton>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Khung Lợi ích bổ sung (2 Cột nhỏ) */}
        <ScrollReveal className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[12px] p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col items-start">
              <div className="mb-3">
                <MonoTag variant="primary">EFFICIENCY {'//'} SPEED</MonoTag>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tăng tốc thu nhập</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hệ thống AI giúp bạn tối ưu hóa thời gian tìm kiếm, tự động ghép với các dự án vừa
                khớp chính xác với tech-stack của bạn.
              </p>
            </div>

            <div className="bg-white rounded-[12px] p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col items-start">
              <div className="mb-3">
                <MonoTag variant="muted">LEGAL {'//'} ESCROW</MonoTag>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                An tâm pháp lý & thanh toán
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Mọi giao dịch được AI giám sát chặt chẽ theo từng cột mốc, giải ngân tự động qua hợp
                đồng ký quỹ Escrow minh bạch.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </main>

      {/* Footer đồng nhất */}
      <LandingFooter />
    </div>
  );
};

export default FreelancerPricingPage;
