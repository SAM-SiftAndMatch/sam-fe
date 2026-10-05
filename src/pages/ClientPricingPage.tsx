import { useMySubscriptions, usePurchasePackage } from '@/features/subscription';
import { PACKAGE_AI_QA_ADVANCED_ID, PACKAGE_BUSINESS_ID } from '@/features/subscription';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GuestHeader from '../components/GuestHeader';
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

  const packageButton = (packageId: string, label: string) => {
    if (ownsPackage(packageId)) {
      return (
        <button
          type="button"
          disabled
          className="w-full bg-white/60 text-[#1D4ED8] text-sm font-bold py-3.5 rounded-full shadow-lg cursor-default border-0 mt-auto"
        >
          Đang sử dụng
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => void handlePurchase(packageId)}
        disabled={purchasingId === packageId}
        className="w-full bg-white text-[#1D4ED8] text-sm hover:bg-gray-50 font-bold py-3.5 rounded-full shadow-lg transition-colors cursor-pointer border-0 mt-auto disabled:opacity-60"
      >
        {purchasingId === packageId ? 'Đang xử lý...' : label}
      </button>
    );
  };
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* 1. Header dành cho khách (Tái sử dụng) */}
      <GuestHeader />

      {/* 2. Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-16 flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-widest mb-4 block">
            BẢNG GIÁ MINH BẠCH
          </span>
          <h1 className="text-4xl md:text-[44px] font-bold text-gray-900 mb-6 tracking-tight leading-snug max-w-2xl">
            Nâng tầm dự án với <span className="text-[#0047FF]">Công nghệ AI</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-xl leading-relaxed">
            Chọn gói dịch vụ phù hợp để kết nối với những tài năng hàng đầu và đảm bảo chất lượng kỹ
            thuật tối ưu.
          </p>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gói dịch vụ linh hoạt</h2>
          <p className="text-gray-500 text-sm">
            Lựa chọn giải pháp phù hợp với quy mô dự án của bạn
          </p>
        </div>

        {error && (
          <div className="w-full max-w-5xl mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="w-full max-w-5xl mb-6 p-3.5 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl">
            {successMessage}
          </div>
        )}

        {/* Pricing Grid (3 Cột) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-5xl mb-24">
          {/* Gói 1: Basic */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col h-full mt-4">
            <div className="mb-8">
              <h2 className="text-[22px] font-bold text-gray-900 mb-2">Basic</h2>
              <p className="text-gray-500 text-xs">Dành cho cá nhân khởi đầu</p>
            </div>

            <div className="flex items-end gap-1 mb-8">
              <span className="text-5xl font-black text-gray-900 leading-none">0đ</span>
              <span className="text-gray-500 text-sm font-medium mb-1">/tháng</span>
            </div>

            <ul className="flex flex-col gap-4 mb-10 flex-grow">
              <li className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-gray-600 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  role="img"
                  aria-label="Check"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[13px] text-gray-700 font-medium">
                  Đăng dự án không giới hạn
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-gray-600 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  role="img"
                  aria-label="Check"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[13px] text-gray-700 font-medium">Phí dịch vụ 5%</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-gray-600 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  role="img"
                  aria-label="Check"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[13px] text-gray-700 font-medium">Hỗ trợ email</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => navigate(paths.PATH_REGISTER)}
              className="w-full bg-white text-gray-800 text-sm font-bold py-3.5 rounded-full transition-colors cursor-pointer border border-gray-200 hover:bg-gray-50 mt-auto"
            >
              Bắt đầu miễn phí
            </button>
          </div>

          {/* Gói 2: Business (Được làm nổi bật) */}
          <div className="bg-gradient-to-br from-[#1D4ED8] to-[#0AAAD7] rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgba(29,78,216,0.25)] flex flex-col relative transform md:-translate-y-4 h-[calc(100%+16px)] border border-blue-400/30">
            {/* Badge Phổ biến */}
            <div className="absolute -top-3 right-8 bg-white text-[#1D4ED8] text-[9px] font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">
              PHỔ BIẾN
            </div>

            <div className="mb-8">
              <h2 className="text-[22px] font-bold text-white mb-2">Business</h2>
              <p className="text-white/80 text-xs">
                Nổi bật + Tuyển gấp không giới hạn, mọi dự án trong 30 ngày
              </p>
            </div>

            <div className="flex items-end gap-1 mb-8">
              <span className="text-[40px] font-black text-white leading-none">249.000đ</span>
              <span className="text-white/80 text-sm font-medium mb-1.5">/tháng</span>
            </div>

            <ul className="flex flex-col gap-4 mb-10 flex-grow">
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-bold">
                  Ghim Nổi bật không giới hạn
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-bold">
                  Tuyển gấp AI Headhunter không giới hạn
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-bold">
                  Áp dụng mọi dự án trong 30 ngày
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-bold">
                  Không cần mua lẻ từng dự án nữa
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-bold">Hỗ trợ 24/7 qua Hotline</span>
              </li>
            </ul>

            {packageButton(PACKAGE_BUSINESS_ID, 'Nâng cấp ngay')}
          </div>

          {/* Gói 3: Premium */}
          <div className="bg-gradient-to-br from-[#1D4ED8] to-[#0AAAD7] rounded-[32px] p-8 md:p-10 shadow-[0_4px_20px_rgba(29,78,216,0.15)] flex flex-col h-full mt-4 border border-blue-400/30">
            <div className="mb-8">
              <h2 className="text-[22px] font-bold text-white mb-2">Premium</h2>
              <p className="text-white/80 text-xs">
                Bảo hành AI QA cho mọi dự án trong 30 ngày (bản tháng của gói lẻ 59k)
              </p>
            </div>

            <div className="flex items-end gap-1 mb-8">
              <span className="text-[40px] font-black text-white leading-none">299.000đ</span>
              <span className="text-white/80 text-sm font-medium mb-1.5">/tháng</span>
            </div>

            <ul className="flex flex-col gap-4 mb-10 flex-grow">
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-bold">Bảo hành chất lượng</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-bold">
                  AI quét lỗi + bảo mật khi bàn giao, mọi dự án
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-bold">
                  Bản tháng của gói lẻ Trọng tài Code 59k
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-bold">Chống nhận về mã nguồn rác</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-bold">Hỗ trợ 24/7 qua Hotline</span>
              </li>
            </ul>

            {packageButton(PACKAGE_AI_QA_ADVANCED_ID, 'Nâng cấp ngay')}
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-16 -mt-16 max-w-xl text-center">
          Gói lẻ theo từng dự án (Ghim 59k · Tuyển gấp 99k · Trọng tài Code 59k) chỉ bán lúc đăng
          việc, không bán tại trang này.
        </p>

        {/* Section Stats (4 cột) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl text-center pt-10 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-[#1D4ED8]">50k+</span>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Freelancer AI
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-[#1D4ED8]">98%</span>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Hài lòng từ khách hàng
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-[#1D4ED8]">24h</span>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Thời gian kết nối TB
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-[#1D4ED8]">100%</span>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Thanh toán an toàn
            </span>
          </div>
        </div>
      </main>

      {/* 3. Footer (Tái sử dụng) */}
      <Footer />
    </div>
  );
};

export default ClientPricingPage;
