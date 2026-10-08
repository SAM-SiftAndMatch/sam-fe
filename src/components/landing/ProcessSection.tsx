import type React from 'react';
import { Fragment, useState } from 'react';
import { MonoTag } from './LandingButtons';
import { ScrollReveal } from './ScrollReveal';

interface WorkflowStep {
  id: string;
  stepNumber: string;
  shortTag: string;
  title: string;
  subtitle: string;
  description: string;
  snippet: React.ReactNode;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'ai-pm',
    stepNumber: '01',
    shortTag: 'AI PM',
    title: 'Tạo yêu cầu (AI PM)',
    subtitle: 'Khảo sát & Bóc tách tài liệu SRS',
    description:
      'Sử dụng AI Brief Assistant để phỏng vấn chi tiết, bóc tách tài liệu đặc tả SRS hoàn hảo chỉ trong 30 giây.',
    snippet: (
      <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-3.5 space-y-2.5">
        <div className="flex items-start gap-2">
          <span className="font-mono text-[10px] text-slate-400 shrink-0 mt-0.5">YOU:</span>
          <div className="text-[11px] text-slate-700 bg-white border border-slate-200/60 rounded-[6px] px-2.5 py-1.5 shadow-2xs">
            "Tôi cần xây dựng app giao đồ ăn cho nhà hàng..."
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-[10px] text-[#1D4ED8] font-semibold shrink-0 mt-0.5">
            AI PM:
          </span>
          <div className="text-[11px] text-slate-800 bg-[#1D4ED8]/[0.05] border border-[#1D4ED8]/20 rounded-[6px] px-2.5 py-1.5">
            <span className="font-mono text-[10px] text-[#1D4ED8] block font-semibold mb-0.5">
              ✓ ĐÃ TẠO SRS (4 MODULES)
            </span>
            <span className="text-slate-600 text-[10.5px] block">
              Scope: Cart, Realtime GPS, Payment Gateway. Stack: Next.js + FastAPI.
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ai-matching',
    stepNumber: '02',
    shortTag: 'AI MATCHING',
    title: 'AI phân tích & ghép đôi',
    subtitle: 'Quét Portfolio & Khớp tài năng',
    description:
      'Hệ thống quét hàng ngàn portfolio và commit mã nguồn thực tế để đề xuất Top 3 chuyên gia khớp nhất 99%.',
    snippet: (
      <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-3 space-y-2">
        <div className="bg-white border border-slate-200/80 rounded-[6px] p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1D4ED8]/10 text-[#1D4ED8] flex items-center justify-center font-mono text-[10px] font-bold">
              HN
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-900">Hoàng Nam</div>
              <div className="text-[10px] text-slate-500 font-mono">Senior Fullstack · 5.0★</div>
            </div>
          </div>
          <span className="font-mono text-[10px] font-semibold text-[#1D4ED8] bg-[#1D4ED8]/[0.08] px-2 py-0.5 rounded-[4px]">
            98.4% MATCH
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-[6px] p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-[10px] font-bold">
              TT
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-900">Thanh Trúc</div>
              <div className="text-[10px] text-slate-500 font-mono">FastAPI Engineer · 4.9★</div>
            </div>
          </div>
          <span className="font-mono text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-[4px]">
            95.1% MATCH
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'ai-qc',
    stepNumber: '03',
    shortTag: 'AI QC',
    title: 'Kiểm định chất lượng (AI QC)',
    subtitle: 'Rà soát mã nguồn & Bản quyền',
    description:
      'Rà soát mã nguồn tự động, phát hiện lỗi cú pháp, kiểm tra bảo mật và bản quyền trước khi giải ngân thanh toán.',
    snippet: (
      <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-3 space-y-1.5 font-mono text-[10.5px]">
        <div className="flex items-center justify-between bg-white border border-slate-200/70 px-2 py-1.5 rounded-[5px]">
          <span className="text-slate-700">Static Code Analysis</span>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
            PASS (0 BUGS)
          </span>
        </div>
        <div className="flex items-center justify-between bg-white border border-slate-200/70 px-2 py-1.5 rounded-[5px]">
          <span className="text-slate-700">Plagiarism / Originality</span>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
            PASS (99.8% GỐC)
          </span>
        </div>
        <div className="flex items-center justify-between bg-white border border-slate-200/70 px-2 py-1.5 rounded-[5px]">
          <span className="text-slate-700">Security OWASP Check</span>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
            PASS (CLEAN)
          </span>
        </div>
      </div>
    ),
  },
];

export const ProcessSection: React.FC = () => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [pinnedStep, setPinnedStep] = useState<number | null>(null);

  const activeIndex = hoveredStep !== null ? hoveredStep : pinnedStep;
  const isAnyActive = activeIndex !== null;

  return (
    <section
      id="process"
      className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative"
    >
      <ScrollReveal className="text-left mb-10 lg:mb-14">
        <div className="flex items-center gap-2 mb-3">
          <MonoTag variant="primary">WORKFLOW {'//'} 03 BƯỚC THÔNG MINH</MonoTag>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Quy trình tuyển dụng thông minh
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Tiết kiệm 80% thời gian tìm kiếm nhờ công nghệ AI hàng đầu: AI PM bóc tách yêu cầu, AI
          Matching kết nối tài năng thực thụ, và AI QC bảo vệ chất lượng bàn giao.
        </p>
      </ScrollReveal>

      {/* Sub-label guideline */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
          <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
            End-to-End Pipeline
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] text-slate-500">
          Di chuột vào từng bước để mở rộng chi tiết
        </span>
      </div>

      {/* Workflow Interactive Track Container */}
      <div
        onMouseLeave={() => setHoveredStep(null)}
        className="w-full relative flex flex-col lg:flex-row items-stretch gap-3 lg:gap-4 transition-all"
      >
        {WORKFLOW_STEPS.map((step, index) => {
          const isActive = activeIndex === index;
          const flexStyle = {
            flex: isActive ? '2.4 1 0%' : isAnyActive ? '0.85 1 0%' : '1 1 0%',
          };

          return (
            <Fragment key={step.id}>
              {/* Step Card Container */}
              <div
                style={flexStyle}
                onMouseEnter={() => setHoveredStep(index)}
                onClick={() => setPinnedStep(pinnedStep === index ? null : index)}
                className={`group relative flex flex-col transition-[flex,transform,opacity] duration-300 ease-out cursor-pointer ${
                  isActive
                    ? 'z-20'
                    : isAnyActive
                      ? 'z-10 opacity-75 hover:opacity-100 scale-[0.99]'
                      : 'z-10 opacity-100'
                }`}
              >
                {/* Title Box Header (The interactive node) */}
                <div
                  className={`w-full p-4 sm:p-5 rounded-[12px] border transition-all duration-300 flex items-center justify-between gap-3 relative select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50/90 to-cyan-50/50 border-[#1D4ED8] shadow-[0_4px_24px_rgba(29,78,216,0.12)]'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Step Number Tag */}
                    <span
                      className={`font-mono text-[10px] tracking-wider uppercase font-bold px-2 py-1 rounded-[5px] shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#1D4ED8] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                      }`}
                    >
                      STEP {step.stepNumber}
                    </span>

                    {/* Step Title & Subtitle */}
                    <div className="flex flex-col min-w-0">
                      <h3
                        className={`font-bold transition-all truncate ${
                          isActive
                            ? 'text-sm sm:text-base text-[#1D4ED8]'
                            : 'text-xs sm:text-sm text-slate-800'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <span className="font-mono text-[10px] text-slate-400 truncate mt-0.5">
                        {step.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Chevron Indicator */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isActive
                        ? 'bg-[#1D4ED8]/10 text-[#1D4ED8] rotate-180'
                        : 'bg-slate-100 text-slate-400 group-hover:text-slate-700 rotate-0'
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Dropdown Content Card (Xổ xuống khi hover) */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isActive
                      ? 'max-h-[500px] opacity-100 mt-3 pointer-events-auto'
                      : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                  }`}
                >
                  <div className="bg-white rounded-[12px] p-5 sm:p-6 border border-slate-200/90 shadow-[0_12px_36px_rgba(15,23,42,0.06)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-[10px] font-semibold text-[#1D4ED8] bg-[#1D4ED8]/10 px-2 py-0.5 rounded-[4px]">
                          {step.shortTag} SPECIFICATION
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {step.stepNumber} / 03
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                        {step.description}
                      </p>
                    </div>

                    {/* Abstract Mini UI Snippet */}
                    {step.snippet}
                  </div>
                </div>
              </div>

              {/* Connector Bridge between Steps (Line & Arrow) */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <>
                  {/* Desktop Horizontal Connector */}
                  <div
                    className="hidden lg:flex items-center justify-center w-6 xl:w-8 h-[58px] shrink-0 relative self-start pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="w-full h-[2px] bg-slate-200 relative overflow-hidden rounded-full">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] transition-opacity duration-300 ${
                          activeIndex === index ? 'opacity-100' : 'opacity-20'
                        }`}
                      />
                    </div>
                    <div
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border flex items-center justify-center shadow-2xs transition-colors ${
                        activeIndex === index
                          ? 'border-[#1D4ED8] text-[#1D4ED8]'
                          : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      <svg
                        className="w-2.5 h-2.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Mobile Vertical Connector */}
                  <div
                    className="lg:hidden flex items-center justify-center h-4 w-full py-1 text-slate-300"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7-7-7" />
                    </svg>
                  </div>
                </>
              )}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
};

export default ProcessSection;
