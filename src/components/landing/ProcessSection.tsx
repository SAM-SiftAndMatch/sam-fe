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
    subtitle: 'Khảo sát & Bóc tách SRS',
    description:
      'Sử dụng AI Brief Assistant để phỏng vấn chi tiết, bóc tách tài liệu đặc tả SRS hoàn hảo chỉ trong 30 giây.',
    snippet: (
      <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-3 space-y-2">
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
      <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-2.5 space-y-1.5">
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
      <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-2.5 space-y-1.5 font-mono text-[10.5px]">
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
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-6 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
          <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
            Workflow Pipeline
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] text-slate-500">
          Di chuột vào từng bước để xem chi tiết
        </span>
      </div>

      {/* Workflow Interactive Morphing Cards Track */}
      <div
        onMouseLeave={() => setHoveredStep(null)}
        className="w-full relative flex flex-col lg:flex-row items-center lg:items-start justify-between transition-all"
      >
        {WORKFLOW_STEPS.map((step, index) => {
          const isActive = activeIndex === index;
          const isOtherActive = isAnyActive && !isActive;

          // Dynamically compute card width classes for desktop
          const cardWidthClasses = isActive
            ? 'lg:max-w-none lg:w-[480px] bg-white border-[#1D4ED8] shadow-[0_14px_40px_rgba(29,78,216,0.12)] -translate-y-1 z-20'
            : isOtherActive
              ? 'lg:max-w-none lg:w-[200px] bg-white/95 border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] opacity-75 hover:opacity-100 scale-[0.98] z-10'
              : 'lg:max-w-none lg:w-[220px] bg-white border-slate-200/90 hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] z-10';

          return (
            <Fragment key={step.id}>
              {/* Morphing Step Card (Title morphs directly into Card) */}
              <div
                onMouseEnter={() => setHoveredStep(index)}
                onClick={() => setPinnedStep(pinnedStep === index ? null : index)}
                className={`group relative flex flex-col rounded-[14px] border p-4 sm:p-5 transition-[width,transform,opacity,border-color,box-shadow] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none w-full max-w-[360px] mx-auto ${cardWidthClasses}`}
              >
                {/* Header: STEP on top center, Title below center */}
                <div className="flex flex-col items-center text-center select-none">
                  {/* STEP Badge ở trên đầu chính giữa */}
                  <span
                    className={`font-mono text-[10px] sm:text-[10.5px] tracking-widest uppercase font-bold px-2.5 py-1 rounded-[5px] transition-colors mb-2 ${
                      isActive
                        ? 'bg-[#1D4ED8] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                    }`}
                  >
                    STEP {step.stepNumber}
                  </span>

                  {/* Title ở dưới chính giữa */}
                  <h3
                    className={`font-bold transition-colors leading-tight ${
                      isActive
                        ? 'text-base sm:text-lg text-[#1D4ED8]'
                        : 'text-xs sm:text-sm text-slate-800 group-hover:text-slate-900'
                    }`}
                  >
                    {step.title}
                  </h3>

                  {/* Subtitle khi ở trạng thái compact (thu gọn bằng CSS Grid mượt mà) */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                      !isActive
                        ? 'grid-rows-[1fr] opacity-100 mt-1'
                        : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <span className="font-mono text-[10px] text-slate-400 block truncate">
                        {step.subtitle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Morphing Detail Body: Unfolds smoothly with CSS Grid 0fr -> 1fr */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-slate-100 pt-3.5 mt-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-[9px] font-bold text-[#1D4ED8] bg-[#1D4ED8]/10 px-2 py-0.5 rounded-[4px]">
                            {step.shortTag} SPECIFICATION
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            {step.stepNumber} / 03
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3.5 text-left">
                          {step.description}
                        </p>
                      </div>

                      {/* Abstract Mini UI Snippet */}
                      <div className="text-left">{step.snippet}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connecting Straight Line (NO ARROWS, long, prominent line) */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <>
                  {/* Desktop Long Straight Horizontal Line */}
                  <div
                    className="hidden lg:flex items-center flex-1 min-w-[48px] self-start mt-[44px] px-3 pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="w-full h-[2.5px] bg-slate-300 relative rounded-full overflow-hidden shadow-2xs">
                      <div
                        className={`absolute inset-0 bg-[#1D4ED8] transition-opacity duration-300 ${
                          activeIndex === index || activeIndex === index + 1
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Mobile Straight Vertical Line */}
                  <div
                    className="lg:hidden flex items-center justify-center h-8 w-full py-1 text-slate-300 pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="h-full w-[2.5px] bg-slate-300 rounded-full" />
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
