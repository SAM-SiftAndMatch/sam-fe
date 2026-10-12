import type React from 'react';
import * as paths from '../../routes/paths';
import { MonoTag, PrimaryButton, SecondaryButton } from './LandingButtons';
import { ScrollReveal } from './ScrollReveal';

export const PricingSection: React.FC = () => {
  return (
    <section
      id="pricing"
      className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative"
    >
      <ScrollReveal className="text-left mb-14">
        <div className="flex items-center gap-2 mb-3">
          <MonoTag variant="primary">BẢNG GIÁ MINH BẠCH {'//'} PLANS</MonoTag>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Gói dịch vụ linh hoạt, minh bạch
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Lựa chọn giải pháp tối ưu theo nhu cầu của bạn: từ cá nhân khởi đầu, doanh nghiệp cần bảo
          hiểm chất lượng AI QC, đến gói công cụ chuyên nghiệp cho freelancer.
        </p>
      </ScrollReveal>

      {/* 3 Plans Aligned in Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* ================= PLAN 1: Phí giao dịch (Basic) ================= */}
        <ScrollReveal delayMs={0} className="h-full">
          <div className="group h-full bg-white rounded-[12px] p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <MonoTag variant="muted">PLAN 01 {'//'} PHÍ GIAO DỊCH</MonoTag>
                <span className="font-mono text-xs text-slate-400">KHỞI ĐẦU</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Basic</h3>
              <p className="text-xs text-slate-500 mb-6">Dành cho cá nhân khởi đầu dự án mới</p>

              <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                <span className="font-mono text-4xl sm:text-5xl font-black text-slate-900 leading-none">
                  0đ
                </span>
                <span className="text-xs text-slate-500 font-mono">/tháng</span>
              </div>

              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                  <span>Đăng dự án không giới hạn số lượng</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                  <span>Phí dịch vụ tiêu chuẩn 5% khi hoàn thành</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                  <span>AI Brief Assistant hỗ trợ mô tả dự án</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                  <span>Hỗ trợ kỹ thuật qua email</span>
                </li>
              </ul>
            </div>

            <SecondaryButton to={paths.PATH_REGISTER} className="w-full">
              Bắt đầu miễn phí
            </SecondaryButton>
          </div>
        </ScrollReveal>

        {/* ================= PLAN 2: Phí kiểm định (Business & AI QC) - HIGHLIGHTED ================= */}
        <ScrollReveal delayMs={100} className="h-full">
          <div className="group h-full bg-white rounded-[12px] p-6 sm:p-8 border-2 border-[#1D4ED8] shadow-[0_4px_20px_rgba(29,78,216,0.08)] hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between relative">
            {/* Highlight Tag */}
            <div className="absolute -top-3.5 right-6">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-[#1D4ED8] text-white px-3 py-1 rounded-[6px] shadow-sm">
                KHUYÊN DÙNG {'//'} PHỔ BIẾN
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <MonoTag variant="primary">PLAN 02 {'//'} PHÍ KIỂM ĐỊNH</MonoTag>
                <span className="font-mono text-xs text-[#1D4ED8] font-bold">BUSINESS + AI QC</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Business & Kiểm Định QC</h3>
              <p className="text-xs text-slate-500 mb-6">
                Dành cho doanh nghiệp cần tối ưu & bảo hiểm chất lượng
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
                  <span>AI Talent Matching ưu tiên hàng đầu</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                  <span>AI QC kiểm định mã nguồn & chống đạo văn mọi dự án</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                  <span>Phí dịch vụ ưu đãi chỉ còn 2%</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                  <span>Ghim Nổi bật + Tuyển gấp AI Headhunter không giới hạn</span>
                </li>
                <li className="flex items-start gap-2.5 font-medium">
                  <span className="text-[#1D4ED8] font-mono text-xs mt-0.5 font-bold">✓</span>
                  <span>Hỗ trợ chuyên biệt 24/7 qua Hotline</span>
                </li>
              </ul>
            </div>

            <PrimaryButton to={paths.PATH_CLIENT_PRICING} className="w-full">
              Nâng cấp ngay
            </PrimaryButton>
          </div>
        </ScrollReveal>

        {/* ================= PLAN 3: Gói SaaS cho Freelancer (PRO DEV) ================= */}
        <ScrollReveal delayMs={200} className="h-full">
          <div className="group h-full bg-white rounded-[12px] p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <MonoTag variant="muted">PLAN 03 {'//'} FREELANCER SAAS</MonoTag>
                <span className="font-mono text-xs text-slate-400">PRO DEV</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">PRO DEV Freelancer</h3>
              <p className="text-xs text-slate-500 mb-6">
                Nhận việc 1 chạm & lá chắn Scope Shield, hiệu lực 30 ngày
              </p>

              <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                <span className="font-mono text-4xl sm:text-5xl font-black text-slate-900 leading-none">
                  149.000đ
                </span>
                <span className="text-xs text-slate-500 font-mono">/tháng</span>
              </div>

              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                  <span>Nhận việc 1 chạm, không cần đấu thầu giá</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                  <span>Thông báo việc làm độc quyền trước 5 phút</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                  <span>Lá chắn Scope Shield chặn phát sinh không công</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                  <span>Huy hiệu Pro Dev xác thực năng lực bởi AI</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400 font-mono text-xs mt-0.5">✓</span>
                  <span>Hỗ trợ ưu tiên 24/7 qua Hotline</span>
                </li>
              </ul>
            </div>

            <SecondaryButton to={paths.PATH_FREELANCER_PRICING} className="w-full">
              Đăng ký Pro Dev
            </SecondaryButton>
          </div>
        </ScrollReveal>
      </div>

      <div className="mt-8 text-center">
        <p className="font-mono text-xs text-slate-500">
          * Gói lẻ theo từng dự án (Ghim 59k · Tuyển gấp 99k · Trọng tài Code 59k) chỉ bán lúc đăng
          việc.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
