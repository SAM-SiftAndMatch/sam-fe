import {
  PACKAGE_AI_QA_ADVANCED_ID,
  PACKAGE_BUSINESS_ID,
  useMySubscriptions,
  usePurchasePackage,
} from '@/features/subscription';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedNumber from '../components/landing/AnimatedNumber';
import InteractiveBackground from '../components/landing/InteractiveBackground';
import { MonoTag, PrimaryButton, SecondaryButton } from '../components/landing/LandingButtons';
import LandingFooter from '../components/landing/LandingFooter';
import LandingNavbar from '../components/landing/LandingNavbar';
import ScrollReveal from '../components/landing/ScrollReveal';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

const ClientPricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { subscriptions, refetch } = useMySubscriptions();
  const { purchase, purchasingId, error, successMessage } = usePurchasePackage();

  const ownsPackage = (packageId: string) =>
    subscriptions.some((s) => s.packageId === packageId && s.status === 'ACTIVE');

  const handlePurchase = async (packageId: string) => {
    if (!isAuthenticated) {
      navigate(paths.PATH_LOGIN, { state: { returnTo: paths.PATH_CLIENT_PRICING } });
      return;
    }
    if (user?.role !== 'CLIENT') {
      navigate(paths.PATH_FREELANCER_PRICING);
      return;
    }
    const result = await purchase(packageId);
    if (result?.vnpayUrl) {
      localStorage.setItem('SAM_PENDING_SUBSCRIPTION', result.id);
      window.location.href = result.vnpayUrl;
      return;
    }
    if (result) {
      await refetch();
    }
  };

  const renderPackageButton = (packageId: string, label: string, isPrimary = false) => {
    if (ownsPackage(packageId)) {
      return (
        <button
          type="button"
          disabled
          className="w-full h-[44px] bg-slate-100 text-slate-500 text-sm font-medium rounded-[8px] cursor-default border border-slate-200 mt-auto"
        >
          Đang sử dụng
        </button>
      );
    }

    if (isPrimary) {
      return (
        <PrimaryButton
          onClick={() => void handlePurchase(packageId)}
          disabled={purchasingId === packageId}
          className="w-full mt-auto"
        >
          {purchasingId === packageId ? 'Đang xử lý...' : label}
        </PrimaryButton>
      );
    }

    return (
      <SecondaryButton
        onClick={() => void handlePurchase(packageId)}
        disabled={purchasingId === packageId}
        className="w-full mt-auto"
      >
        {purchasingId === packageId ? 'Đang xử lý...' : label}
      </SecondaryButton>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col relative selection:bg-[#1D4ED8]/10 selection:text-[#1D4ED8]">
      {/* Background Matrix Canvas */}
      <InteractiveBackground />

      {/* Morphing Sticky Navbar */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col items-center relative z-10">
        {/* Header Section */}
        <ScrollReveal className="text-center mb-14 max-w-3xl flex flex-col items-center">
          <div className="mb-3">
            <MonoTag variant="primary">BẢNG GIÁ MINH BẠCH {'//'} DOANH NGHIỆP</MonoTag>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Nâng tầm dự án với <span className="text-[#1D4ED8]">Công nghệ AI</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
            Chọn gói dịch vụ phù hợp để kết nối với những tài năng hàng đầu và đảm bảo chất lượng kỹ
            thuật tối ưu qua hệ thống kiểm định AI QC.
          </p>
        </ScrollReveal>

        {/* Feedback Alerts */}
        {error && (
          <div className="w-full max-w-5xl mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-[8px] font-mono">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="w-full max-w-5xl mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-[8px] font-mono">
            {successMessage}
          </div>
        )}

        {/* Pricing Grid (3 Cột Đồng Nhất) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full items-stretch mb-16">
          {/* Gói 1: Basic */}
          <ScrollReveal delayMs={0} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <MonoTag variant="muted">PLAN 01 {'//'} BASIC</MonoTag>
                  <span className="font-mono text-xs text-slate-400">KHỞI ĐẦU</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Basic</h2>
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

          {/* Gói 2: Business (Được làm nổi bật) */}
          <ScrollReveal delayMs={100} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-8 border-2 border-[#1D4ED8] shadow-[0_4px_20px_rgba(29,78,216,0.08)] hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between relative">
              {/* Badge Phổ biến */}
              <div className="absolute -top-3.5 right-6">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-[#1D4ED8] text-white px-3 py-1 rounded-[6px] shadow-sm">
                  PHỔ BIẾN
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <MonoTag variant="primary">PLAN 02 {'//'} BUSINESS</MonoTag>
                  <span className="font-mono text-xs text-[#1D4ED8] font-bold">TỐI ƯU</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Business</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Nổi bật + Tuyển gấp không giới hạn, mọi dự án trong 30 ngày
                </p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                  <span className="font-mono text-4xl sm:text-5xl font-black text-[#1D4ED8] leading-none">
                    249.000đ
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/tháng</span>
                </div>

                <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-800">
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                    <span>Ghim Nổi bật không giới hạn</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                    <span>Tuyển gấp AI Headhunter không giới hạn</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                    <span>Áp dụng mọi dự án trong 30 ngày</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                    <span>Không cần mua lẻ từng dự án nữa</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                    <span>Hỗ trợ 24/7 qua Hotline</span>
                  </li>
                </ul>
              </div>

              {renderPackageButton(PACKAGE_BUSINESS_ID, 'Nâng cấp ngay', true)}
            </div>
          </ScrollReveal>

          {/* Gói 3: Premium */}
          <ScrollReveal delayMs={200} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <MonoTag variant="muted">PLAN 03 {'//'} PREMIUM QC</MonoTag>
                  <span className="font-mono text-xs text-slate-400">BẢO HIỂM</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Premium</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Bảo hành AI QA cho mọi dự án trong 30 ngày (bản tháng của gói lẻ 59k)
                </p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                  <span className="font-mono text-4xl sm:text-5xl font-black text-slate-900 leading-none">
                    299.000đ
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/tháng</span>
                </div>

                <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                    <span>Bảo hiểm chất lượng bàn giao</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                    <span>AI quét lỗi + bảo mật khi bàn giao, mọi dự án</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                    <span>Bản tháng của gói lẻ Trọng tài Code 59k</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                    <span>Chống nhận về mã nguồn rác</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                    <span>Hỗ trợ 24/7 qua Hotline</span>
                  </li>
                </ul>
              </div>

              {renderPackageButton(PACKAGE_AI_QA_ADVANCED_ID, 'Nâng cấp ngay', false)}
            </div>
          </ScrollReveal>
        </div>

        <p className="font-mono text-xs text-slate-500 mb-16 max-w-xl text-center">
          * Gói lẻ theo từng dự án (Ghim 59k · Tuyển gấp 99k · Trọng tài Code 59k) chỉ bán lúc đăng
          việc, không bán tại trang này.
        </p>

        {/* Section Stats (4 cột kỹ thuật) */}
        <ScrollReveal className="w-full max-w-4xl pt-10 border-t border-slate-200/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-[#1D4ED8]">
                <AnimatedNumber value={50000} suffix="+" />
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Freelancer AI
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-[#1D4ED8]">
                <AnimatedNumber value={98} suffix="%" />
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Hài lòng từ khách hàng
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-[#1D4ED8]">&lt; 24H</span>
              <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Thời gian kết nối TB
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-[#1D4ED8]">100%</span>
              <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Thanh toán an toàn
              </span>
            </div>
          </div>
        </ScrollReveal>
      </main>

      {/* Footer đồng nhất */}
      <LandingFooter />
    </div>
  );
};

export default ClientPricingPage;
