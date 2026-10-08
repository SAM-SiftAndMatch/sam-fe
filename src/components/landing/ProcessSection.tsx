import type React from 'react';
import { MonoTag } from './LandingButtons';
import { ScrollReveal } from './ScrollReveal';

export const ProcessSection: React.FC = () => {
  return (
    <section
      id="process"
      className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative"
    >
      {/* Global SVG Definitions for Electric Stream */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="electric-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="electric-cyan-stream" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="35%" stopColor="#2563EB" />
            <stop offset="70%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
        </defs>
      </svg>

      <ScrollReveal className="text-left mb-16">
        <div className="flex items-center gap-2 mb-3">
          <MonoTag variant="primary">QUY TRÌNH {'//'} 03 BƯỚC THÔNG MINH</MonoTag>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Quy trình tuyển dụng thông minh
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Tiết kiệm 80% thời gian tìm kiếm nhờ công nghệ AI hàng đầu: AI PM bóc tách yêu cầu, AI
          Matching kết nối tài năng thực thụ, và AI QC bảo vệ chất lượng bàn giao.
        </p>
      </ScrollReveal>

      {/* 3-Step Flow Container with Connected Electric Flow */}
      <div className="relative">
        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-8 relative z-10">
          {/* STEP 1: AI PM */}
          <ScrollReveal delayMs={0} className="relative">
            <div className="group relative h-full bg-white rounded-[12px] p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between card-electric-glow-1">
              {/* Electric Border Loop on Card 1 */}
              <svg
                className="absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] pointer-events-none rounded-[13px] overflow-visible z-20"
                aria-hidden="true"
              >
                {/* Blueprint circuit track */}
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="12"
                  fill="none"
                  stroke="#2563EB"
                  strokeOpacity="0.12"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* Active Electric Stream */}
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="12"
                  fill="none"
                  stroke="url(#electric-cyan-stream)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray="24 76"
                  filter="url(#electric-glow)"
                  className="animate-electric-card-1"
                />
              </svg>

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <MonoTag variant="muted">STEP 01 {'//'} AI PM</MonoTag>
                  <span className="font-mono text-xs text-slate-400">01 / 03</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Tạo yêu cầu (AI PM)</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Sử dụng AI Brief Assistant để phỏng vấn chi tiết, bóc tách tài liệu đặc tả SRS
                  hoàn hảo chỉ trong 30 giây.
                </p>
              </div>

              {/* Abstract UI Snippet: Mini Chat Dialogue */}
              <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-3.5 space-y-2.5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200">
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
            </div>

            {/* Desktop Horizontal Bridge connecting Card 1 to Card 2 */}
            <div
              className="hidden lg:flex absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-6 items-center justify-center z-30 pointer-events-none"
              aria-hidden="true"
            >
              {/* Circuit wire track */}
              <div className="w-full h-[2px] bg-blue-200/60 relative">
                {/* Traveling electric bolt */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-3 h-[4px] rounded-full bg-gradient-to-r from-[#2563EB] to-[#00E5FF] shadow-[0_0_10px_#00E5FF,0_0_5px_#2563EB] animate-bridge-1-h" />
              </div>
              {/* Left terminal pin */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#1D4ED8] border-2 border-white shadow-xs" />
              {/* Right terminal pin */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-[#1D4ED8] border-2 border-white shadow-xs" />
            </div>

            {/* Mobile Vertical Bridge connecting Card 1 to Card 2 */}
            <div
              className="lg:hidden flex absolute -bottom-8 left-1/2 -translate-x-1/2 w-6 h-8 items-center justify-center z-30 pointer-events-none"
              aria-hidden="true"
            >
              <div className="h-full w-[2px] bg-blue-200/60 relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 h-3 w-[4px] rounded-full bg-gradient-to-b from-[#2563EB] to-[#00E5FF] shadow-[0_0_10px_#00E5FF] animate-bridge-1-v" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#1D4ED8] border-2 border-white shadow-xs" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#1D4ED8] border-2 border-white shadow-xs" />
            </div>
          </ScrollReveal>

          {/* STEP 2: AI MATCHING */}
          <ScrollReveal delayMs={100} className="relative">
            <div className="group relative h-full bg-white rounded-[12px] p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between card-electric-glow-2">
              {/* Electric Border Loop on Card 2 */}
              <svg
                className="absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] pointer-events-none rounded-[13px] overflow-visible z-20"
                aria-hidden="true"
              >
                {/* Blueprint circuit track */}
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="12"
                  fill="none"
                  stroke="#2563EB"
                  strokeOpacity="0.12"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* Active Electric Stream */}
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="12"
                  fill="none"
                  stroke="url(#electric-cyan-stream)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray="24 76"
                  filter="url(#electric-glow)"
                  className="animate-electric-card-2"
                />
              </svg>

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <MonoTag variant="muted">STEP 02 {'//'} AI MATCHING</MonoTag>
                  <span className="font-mono text-xs text-slate-400">02 / 03</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">AI phân tích & Ghép đôi</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Hệ thống quét hàng ngàn portfolio và commit mã nguồn thực tế để đề xuất Top 3
                  chuyên gia khớp nhất 99%.
                </p>
              </div>

              {/* Abstract UI Snippet: Mini Match List */}
              <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-3 space-y-2 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200">
                <div className="bg-white border border-slate-200/80 rounded-[6px] p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#1D4ED8]/10 text-[#1D4ED8] flex items-center justify-center font-mono text-[10px] font-bold">
                      HN
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-900">Hoàng Nam</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Senior Fullstack · 5.0★
                      </div>
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
                      <div className="text-[10px] text-slate-500 font-mono">
                        FastAPI Engineer · 4.9★
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-[4px]">
                    95.1% MATCH
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Horizontal Bridge connecting Card 2 to Card 3 */}
            <div
              className="hidden lg:flex absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-6 items-center justify-center z-30 pointer-events-none"
              aria-hidden="true"
            >
              {/* Circuit wire track */}
              <div className="w-full h-[2px] bg-blue-200/60 relative">
                {/* Traveling electric bolt */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-3 h-[4px] rounded-full bg-gradient-to-r from-[#2563EB] to-[#00E5FF] shadow-[0_0_10px_#00E5FF,0_0_5px_#2563EB] animate-bridge-2-h" />
              </div>
              {/* Left terminal pin */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#1D4ED8] border-2 border-white shadow-xs" />
              {/* Right terminal pin */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-[#1D4ED8] border-2 border-white shadow-xs" />
            </div>

            {/* Mobile Vertical Bridge connecting Card 2 to Card 3 */}
            <div
              className="lg:hidden flex absolute -bottom-8 left-1/2 -translate-x-1/2 w-6 h-8 items-center justify-center z-30 pointer-events-none"
              aria-hidden="true"
            >
              <div className="h-full w-[2px] bg-blue-200/60 relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 h-3 w-[4px] rounded-full bg-gradient-to-b from-[#2563EB] to-[#00E5FF] shadow-[0_0_10px_#00E5FF] animate-bridge-2-v" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#1D4ED8] border-2 border-white shadow-xs" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#1D4ED8] border-2 border-white shadow-xs" />
            </div>
          </ScrollReveal>

          {/* STEP 3: AI QC */}
          <ScrollReveal delayMs={200} className="relative">
            <div className="group relative h-full bg-white rounded-[12px] p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between card-electric-glow-3">
              {/* Electric Border Loop on Card 3 */}
              <svg
                className="absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] pointer-events-none rounded-[13px] overflow-visible z-20"
                aria-hidden="true"
              >
                {/* Blueprint circuit track */}
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="12"
                  fill="none"
                  stroke="#2563EB"
                  strokeOpacity="0.12"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* Active Electric Stream */}
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="12"
                  fill="none"
                  stroke="url(#electric-cyan-stream)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray="24 76"
                  filter="url(#electric-glow)"
                  className="animate-electric-card-3"
                />
              </svg>

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <MonoTag variant="muted">STEP 03 {'//'} AI QC</MonoTag>
                  <span className="font-mono text-xs text-slate-400">03 / 03</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Kiểm định chất lượng (AI QC)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Rà soát mã nguồn tự động, phát hiện lỗi cú pháp, kiểm tra bảo mật và bản quyền
                  trước khi giải ngân thanh toán.
                </p>
              </div>

              {/* Abstract UI Snippet: Mini QC Report with Pass/Fail Lines */}
              <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-3 space-y-1.5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200 font-mono text-[10.5px]">
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
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
