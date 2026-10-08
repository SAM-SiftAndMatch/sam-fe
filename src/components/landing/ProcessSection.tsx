import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { MonoTag } from './LandingButtons';
import { ScrollReveal } from './ScrollReveal';

export const ProcessSection: React.FC = () => {
  const [lineDrawn, setLineDrawn] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setLineDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative"
    >
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

      {/* 3-Step Flow Container */}
      <div className="relative">
        {/* Horizontal Connecting Flow Line (Desktop) */}
        <div className="hidden lg:block absolute top-[28px] left-[15%] right-[15%] h-[1px] bg-slate-200 z-0">
          <div
            className="h-[1px] bg-[#1D4ED8] transition-all duration-1000 ease-out"
            style={{ width: lineDrawn ? '100%' : '0%' }}
          />
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {/* STEP 1: AI PM */}
          <ScrollReveal delayMs={0}>
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
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
          </ScrollReveal>

          {/* STEP 2: AI MATCHING */}
          <ScrollReveal delayMs={100}>
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
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
          </ScrollReveal>

          {/* STEP 3: AI QC */}
          <ScrollReveal delayMs={200}>
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
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
