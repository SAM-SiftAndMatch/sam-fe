import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedNumber from '../components/landing/AnimatedNumber';
import CategoriesSection from '../components/landing/CategoriesSection';
import ComparisonSection from '../components/landing/ComparisonSection';
import CtaBand from '../components/landing/CtaBand';
import FeaturesBento from '../components/landing/FeaturesBento';
import InteractiveBackground from '../components/landing/InteractiveBackground';
import { MonoTag, PrimaryButton, SecondaryButton } from '../components/landing/LandingButtons';
import LandingFooter from '../components/landing/LandingFooter';
import LandingNavbar from '../components/landing/LandingNavbar';
import PricingSection from '../components/landing/PricingSection';
import ProcessSection from '../components/landing/ProcessSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import * as paths from '../routes/paths';

const ClientLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');

  // LOCKED CHAT BOX PLACEHOLDER TYPING LOGIC
  useEffect(() => {
    const fullText = "Mô tả công việc bạn cần (ví dụ: 'Thiết kế logo hiện đại cho startup')";
    let i = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const type = () => {
      if (!isDeleting) {
        setPlaceholderText(fullText.slice(0, i + 1));
        i++;
        if (i === fullText.length) {
          isDeleting = true;
          timeoutId = setTimeout(type, 3000); // Wait before deleting
        } else {
          timeoutId = setTimeout(type, 50); // Typing speed
        }
      } else {
        setPlaceholderText(fullText.slice(0, i - 1));
        i--;
        if (i === 0) {
          isDeleting = false;
          timeoutId = setTimeout(type, 500); // Wait before re-typing
        } else {
          timeoutId = setTimeout(type, 20); // Deleting speed
        }
      }
    };

    timeoutId = setTimeout(type, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSearch = (query?: string) => {
    const q = query || searchQuery;
    if (!q.trim()) return; // Do nothing if empty

    navigate(paths.PATH_LOGIN, {
      state: { initialQuery: q, returnTo: paths.PATH_CLIENT_AI_BRIEF },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col relative selection:bg-[#1D4ED8]/10 selection:text-[#1D4ED8]">
      {/* 1. INTERACTIVE CANVAS BACKGROUND */}
      <InteractiveBackground />

      {/* 2. STICKY TOP NAVBAR (Slim 64px) */}
      <LandingNavbar />

      {/* 3. MAIN CONTENT (12-Column Grid, Max 1200px) */}
      <main className="flex-1 w-full flex flex-col items-center relative z-10">
        {/* ================= HERO SECTION ================= */}
        <section
          id="hero"
          className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20 lg:pb-28 flex flex-col items-start text-left"
        >
          {/* Hero Kicker (Item 1 - 0ms delay) */}
          <div className="animate-hero-fade-up mb-4" style={{ animationDelay: '0ms' }}>
            <MonoTag variant="primary">AI FREELANCE MARKETPLACE {'//'} SIFT & MATCH</MonoTag>
          </div>

          {/* Left-Aligned Headline (Item 2 - 80ms delay) */}
          <h1
            className="animate-hero-fade-up text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-slate-900 leading-[1.18] tracking-tight mb-5 max-w-3xl"
            style={{ animationDelay: '80ms' }}
          >
            Kết nối Freelancer <br />
            <span className="text-[#1D4ED8]">phù hợp nhất</span> cho dự án
          </h1>

          {/* Short Sub-Copy (Item 3 - 160ms delay) */}
          <p
            className="animate-hero-fade-up text-sm sm:text-base text-slate-600 mb-8 max-w-2xl leading-relaxed"
            style={{ animationDelay: '160ms' }}
          >
            Nền tảng đầu tiên tại Việt Nam ứng dụng AI để phân tích và đề xuất nhân tài chính xác
            99% cho nhu cầu doanh nghiệp. AI PM phỏng vấn lập specs, AI Matching quét portfolio, và
            AI QC kiểm định chất lượng trước khi bàn giao.
          </p>

          {/* Chat prompt label (Item 4 - 240ms delay) */}
          <div className="animate-hero-fade-up w-full" style={{ animationDelay: '240ms' }}>
            <h2 className="text-sm font-mono uppercase tracking-wider font-semibold text-slate-700 mb-3">
              Bạn cần hoàn thành công việc gì?
            </h2>

            {/* LOCKED COMPONENT: Chat Input Box (Exact markup, classes, styling and behavior preserved) */}
            <div className="w-full max-w-4xl bg-white rounded-[28px] sm:rounded-full p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 relative z-10 mb-4 gap-2 sm:gap-0">
              <div className="flex items-center flex-1 min-w-0">
                <span className="pl-4 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Search"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  aria-label="Tìm kiếm công việc"
                  placeholder={placeholderText}
                  className="flex-1 bg-transparent border-0 focus:ring-0 outline-none text-sm px-3 text-gray-700 placeholder:text-gray-400 min-w-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="bg-[#1D4ED8] hover:bg-[#153bb5] text-white text-sm font-bold px-6 sm:px-8 py-3 rounded-full transition-colors cursor-pointer border-0 shrink-0"
              >
                Tạo mô tả
              </button>
            </div>
          </div>

          {/* 3 Small Example-Prompt Chips (Item 5 - 320ms delay, outside chat component) */}
          <div
            className="animate-hero-fade-up flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-500"
            style={{ animationDelay: '320ms' }}
          >
            <span className="font-mono text-slate-400 text-xs">Gợi ý:</span>
            {['Phát triển Website', 'Trợ lý ảo AI', 'AI Engineer'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSearch(tag)}
                className="font-mono text-xs px-3 py-1.5 rounded-[6px] border border-slate-200 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] hover:bg-[#1D4ED8]/[0.06] transition-colors cursor-pointer active:scale-[0.97]"
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* Small Trust Line (Item 6 - 400ms delay) */}
          <div
            className="animate-hero-fade-up flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-600 font-mono mb-8"
            style={{ animationDelay: '400ms' }}
          >
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              10,000+ Freelancers
            </span>
            <span className="text-slate-300">/</span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] inline-block" />
              5,000+ Dự án
            </span>
            <span className="text-slate-300">/</span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              98% Hài lòng
            </span>
          </div>

          {/* Action Buttons (Item 7 - 440ms delay) */}
          <div
            className="animate-hero-fade-up flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-16"
            style={{ animationDelay: '440ms' }}
          >
            <PrimaryButton to={paths.PATH_CLIENT_AI_BRIEF}>Tạo yêu cầu công việc</PrimaryButton>
            <SecondaryButton to={paths.PATH_FREELANCER}>Tìm Việc Freelance</SecondaryButton>
          </div>

          {/* Hero Quick Stats Row (Item 8 - 480ms delay, aligned, clean numbers) */}
          <div
            className="animate-hero-fade-up w-full grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-200/80"
            style={{ animationDelay: '480ms' }}
          >
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-[#1D4ED8]">
                <AnimatedNumber value={10000} suffix="+" />
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Freelancer xác thực
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-[#1D4ED8]">
                <AnimatedNumber value={5000} suffix="+" />
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Dự án hoàn thành
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-[#1D4ED8]">
                <AnimatedNumber value={98} suffix="%" />
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Khách hàng hài lòng
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-[#1D4ED8]">&lt; 24H</span>
              <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Kết nối nhân tài
              </span>
            </div>
          </div>
        </section>

        {/* ================= 4. SECTION QUY TRÌNH (3-Step Flow) ================= */}
        <ProcessSection />

        {/* ================= 5. SECTION TÍNH NĂNG (Bento Grid) ================= */}
        <FeaturesBento />

        {/* ================= 6. SECTION LĨNH VỰC PHỔ BIẾN (Categories) ================= */}
        <CategoriesSection />

        {/* ================= 7. SECTION SO VỚI CHỢ TRUYỀN THỐNG (Comparison Table) ================= */}
        <ComparisonSection />

        {/* ================= 8. SECTION BẢNG GIÁ (3 Plans) ================= */}
        <PricingSection />

        {/* ================= 9. SECTION ĐÁNH GIÁ (Testimonials) ================= */}
        <TestimonialsSection />

        {/* ================= 10. FINAL CTA BAND ================= */}
        <CtaBand />
      </main>

      {/* 11. COMPACT MULTI-COLUMN FOOTER */}
      <LandingFooter />
    </div>
  );
};

export default ClientLandingPage;
