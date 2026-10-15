import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedNumber from '../components/landing/AnimatedNumber';
import CategoriesSection from '../components/landing/CategoriesSection';
import ComparisonSection from '../components/landing/ComparisonSection';
import CtaBand from '../components/landing/CtaBand';
import FeaturesBento from '../components/landing/FeaturesBento';
import InteractiveBackground from '../components/landing/InteractiveBackground';
import { PrimaryButton, SecondaryButton } from '../components/landing/LandingButtons';
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

      {/* 3. MAIN CONTENT */}
      <main className="flex-1 w-full flex flex-col items-center relative z-10">
        {/* ================= HERO SECTION ================= */}
        <section
          id="hero"
          className="relative isolate flex w-full max-w-[1440px] flex-col items-center overflow-hidden px-4 pt-20 pb-20 text-center sm:px-6 sm:pt-24 lg:min-h-[calc(100svh-4rem)] lg:justify-center lg:px-8 lg:pb-28"
        >
          {/* Centered Headline */}
          <h1 className="relative z-10 mb-7 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-slate-900 sm:text-5xl md:text-6xl lg:text-[68px]">
            <span className="hero-title-line hero-title-line-one">
              Kết nối <span className="hero-title-accent">đúng Freelancer</span>
            </span>
            <span className="hero-title-line hero-title-line-two mt-1 text-slate-800">
              cho dự án của bạn
            </span>
          </h1>

          {/* Chat prompt label */}
          <div
            className="animate-hero-fade-up relative z-10 flex w-full flex-col items-center"
            style={{ animationDelay: '320ms' }}
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-700">
              Bạn cần hoàn thành công việc gì?
            </h2>

            {/* LOCKED COMPONENT: Chat Input Box (Exact markup, classes, styling and behavior preserved) */}
            <div className="relative z-10 mb-4 flex w-full max-w-5xl flex-col items-stretch gap-2 rounded-[28px] border border-gray-100 bg-white p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full">
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
            className="animate-hero-fade-up relative z-10 mb-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500"
            style={{ animationDelay: '460ms' }}
          >
            <span className="text-slate-400 text-xs">Gợi ý:</span>
            {['Phát triển Website', 'Trợ lý ảo AI', 'AI Engineer'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSearch(tag)}
                className="text-xs px-3 py-1.5 rounded-[6px] border border-slate-200 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] hover:bg-[#1D4ED8]/[0.06] transition-colors cursor-pointer active:scale-[0.97]"
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* Small Trust Line (Item 6 - 400ms delay) */}
          <div
            className="animate-hero-fade-up relative z-10 mb-10 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 sm:gap-6"
            style={{ animationDelay: '540ms' }}
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
            className="animate-hero-fade-up relative z-10 mb-16 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
            style={{ animationDelay: '620ms' }}
          >
            <PrimaryButton to={paths.PATH_CLIENT_AI_BRIEF}>Tạo yêu cầu công việc</PrimaryButton>
            <SecondaryButton to={paths.PATH_FREELANCER}>Tìm Việc Freelance</SecondaryButton>
          </div>

          {/* Hero Quick Stats Row (Item 8 - 480ms delay, aligned, clean numbers) */}
          <div
            className="animate-hero-fade-up relative z-10 grid w-full grid-cols-2 gap-6 border-t border-slate-200/80 pt-10 md:grid-cols-4"
            style={{ animationDelay: '700ms' }}
          >
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-extrabold text-[#1D4ED8] sm:text-4xl">
                <AnimatedNumber value={10000} suffix="+" />
              </span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Freelancer xác thực
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-extrabold text-[#1D4ED8] sm:text-4xl">
                <AnimatedNumber value={5000} suffix="+" />
              </span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Dự án hoàn thành
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-extrabold text-[#1D4ED8] sm:text-4xl">
                <AnimatedNumber value={98} suffix="%" />
              </span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Khách hàng hài lòng
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-extrabold text-[#1D4ED8] sm:text-4xl">&lt; 24H</span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
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
