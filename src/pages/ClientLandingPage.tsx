import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectBriefPrompt from '../components/ProjectBriefPrompt';
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
            <ProjectBriefPrompt
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
            />
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
