import type React from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { MonoTag } from './LandingButtons';
import { ScrollReveal } from './ScrollReveal';

export const FeaturesBento: React.FC = () => {
  return (
    <section
      id="features"
      className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative"
    >
      <ScrollReveal className="text-left mb-14">
        <div className="flex items-center gap-2 mb-3">
          <MonoTag variant="primary">TÍNH NĂNG VƯỢT TRỘI {'//'} BENTO GRID</MonoTag>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Công nghệ lõi bảo vệ chất lượng dự án
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Không chỉ dừng lại ở việc kết nối, SAM ứng dụng AI sâu vào từng mắt xích vận hành để loại
          bỏ rủi ro, đảm bảo chất lượng kỹ thuật cao nhất cho cả khách hàng và freelancer.
        </p>
      </ScrollReveal>

      {/* Bento Grid: 1 large, 2 medium, 3 small */}
      <div className="grid grid-cols-12 gap-6">
        {/* ================= TILE 1: LARGE (8 cols on lg) - CODE SCAN RESULT ================= */}
        <div className="col-span-12 lg:col-span-8">
          <ScrollReveal delayMs={0} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <MonoTag variant="primary">AI QC {'//'} STATIC ANALYSIS</MonoTag>
                  <span className="font-mono text-xs text-slate-400">CORE SENTINEL</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                  AI Trọng tài QC & Quét mã nguồn tự động
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mb-6">
                  Loại bỏ nguy cơ nhận về mã nguồn rác, lỗi tiềm ẩn hay thiếu kiểm thử. Hệ thống tự
                  động kiểm tra cú pháp, quét lỗ hổng bảo mật và đối soát chất lượng trước khi
                  nghiệm thu.
                </p>
              </div>

              {/* Tiny live-looking UI mockup: Terminal Code Scan Result */}
              <div className="rounded-[8px] bg-slate-900 text-slate-200 p-4 font-mono text-[11px] space-y-2 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                    <span className="ml-1 text-slate-400">sam-qc --inspect delivery-v2.4</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">STATUS: PASSED</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">✓ Syntax & Code Smell Analysis</span>
                  <span className="text-emerald-400 font-bold">
                    <AnimatedNumber value={0} /> BUGS / 0 WARNINGS
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">✓ Security Audit (OWASP Top 10)</span>
                  <span className="text-emerald-400 font-bold">CLEAN & SECURE</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">✓ Automated Unit Test Suite</span>
                  <span className="text-blue-400 font-bold">
                    <AnimatedNumber value={48} suffix="/48" /> PASSED (
                    <AnimatedNumber value={100} suffix="%" />)
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-800/80 pt-2 text-[10px] text-slate-400">
                  <span>Execution Time: 1.42s</span>
                  <span className="text-slate-300 font-semibold">
                    QA Verdict: ĐẠT TIÊU CHUẨN BÀN GIAO
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ================= TILE 2: MEDIUM (4 cols on lg) - MATCH SCORE ================= */}
        <div className="col-span-12 lg:col-span-4">
          <ScrollReveal delayMs={100} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <MonoTag variant="muted">ALGORITHM {'//'} MATCHING</MonoTag>
                  <span className="font-mono text-xs text-slate-400">99% PRECISION</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  AI Matching Score
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Quét chuyên sâu portfolio, các dự án đã bàn giao và năng lực thực chiến thay vì
                  đọc CV thông thường.
                </p>
              </div>

              {/* Live Mockup: Match Score Card */}
              <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-4 space-y-3 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono text-slate-500 uppercase">Match Score</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#1D4ED8]">
                    <AnimatedNumber value={98.4} decimals={1} suffix="%" />
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1D4ED8] h-full rounded-full w-[98.4%]" />
                </div>

                <div className="font-mono text-[10.5px] space-y-1.5 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span>Độ khớp kỹ năng:</span>
                    <span className="font-semibold text-slate-900">99.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dự án tương tự:</span>
                    <span className="font-semibold text-slate-900">14 dự án</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời gian phản hồi:</span>
                    <span className="font-semibold text-slate-900">&lt; 15 phút</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ================= TILE 3: MEDIUM (6 cols on lg) - PLAGIARISM PERCENTAGE ================= */}
        <div className="col-span-12 lg:col-span-6">
          <ScrollReveal delayMs={150} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <MonoTag variant="muted">COPYRIGHT {'//'} PLAGIARISM</MonoTag>
                  <span className="font-mono text-xs text-slate-400">VERIFIED ORIGINAL</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Kiểm tra chống đạo văn & Bản quyền
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Đảm bảo 100% sản phẩm bàn giao là nguyên bản, không sao chép từ dự án mở hay vi
                  phạm sở hữu trí tuệ doanh nghiệp.
                </p>
              </div>

              {/* Live Mockup: Plagiarism Percentage */}
              <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-4 space-y-3 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase">Tỷ lệ trùng lặp:</span>
                  <span className="text-lg font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
                    <AnimatedNumber value={0.2} decimals={1} suffix="%" />
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Mã nguồn độc quyền:</span>
                    <span className="font-bold text-slate-900">99.8% Original</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full w-[99.8%]" />
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Đối soát cơ sở dữ liệu: 45.000+ repos & giấy phép bản quyền hợp lệ.
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ================= TILE 4: SMALL (6 cols on lg) - SCOPE SHIELD ================= */}
        <div className="col-span-12 lg:col-span-6">
          <ScrollReveal delayMs={200} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <MonoTag variant="muted">SCOPE SHIELD {'//'} DEFENSE</MonoTag>
                  <span className="font-mono text-xs text-slate-400">ANTI-CREEP</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Lá chắn yêu cầu tự động (Scope Shield)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Tự động phát hiện các yêu cầu phát sinh ngoài phạm vi hợp đồng, bảo vệ quyền lợi
                  freelancer và giữ đúng timeline cho khách hàng.
                </p>
              </div>

              {/* Live Mockup: Scope Shield Sentinel */}
              <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-3.5 space-y-2 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200 font-mono text-[11px]">
                <div className="flex items-center justify-between bg-white border border-slate-200/80 p-2 rounded-[6px]">
                  <span className="text-slate-600">Phạm vi gốc (SRS):</span>
                  <span className="text-slate-900 font-bold">5 modules [ĐÃ KHÓA]</span>
                </div>
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2 rounded-[6px] text-amber-900">
                  <span>Yêu cầu thêm mới:</span>
                  <span className="font-bold text-[10px]">+ Realtime Video Call</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-0.5">
                  Action: Hệ thống đề xuất tạo Milestone bổ sung thay vì tranh cãi phạm vi.
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ================= TILE 5: SMALL (6 cols on lg) - ESCROW VAULT ================= */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-6">
          <ScrollReveal delayMs={250} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <MonoTag variant="muted">ESCROW {'//'} MILESTONE</MonoTag>
                  <span className="font-mono text-xs text-slate-400">100% AN TOÀN</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Ký quỹ Escrow theo từng cột mốc
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Ngân sách được tạm giữ an toàn tại sàn và chỉ giải ngân từng phần sau khi AI QC
                  kiểm định và khách hàng ký duyệt.
                </p>
              </div>

              {/* Live Mockup: Milestone Tracker */}
              <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-3 space-y-2 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200 font-mono text-[10.5px]">
                <div className="flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1.5 rounded-[5px]">
                  <span className="text-slate-700">Mốc 1: Giao diện UI & Specs</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                    ĐÃ GIẢI NGÂN
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1.5 rounded-[5px]">
                  <span className="text-slate-700">Mốc 2: Backend & AI QC</span>
                  <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                    ĐANG KÝ QUỸ
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ================= TILE 6: SMALL (6 cols on lg) - AI PM BRIEF ASSISTANT ================= */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-6">
          <ScrollReveal delayMs={300} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <MonoTag variant="muted">AI BRIEF {'//'} ASSISTANT</MonoTag>
                  <span className="font-mono text-xs text-slate-400">CHỈ 30 GIÂY</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  AI PM Phỏng vấn & Lập đặc tả
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Bạn không cần rành kỹ thuật, AI PM sẽ đặt những câu hỏi then chốt để bóc tách mục
                  tiêu, timeline và ngân sách tối ưu.
                </p>
              </div>

              {/* Live Mockup: Prompt to SRS breakdown */}
              <div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-3 space-y-1.5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200 font-mono text-[10.5px]">
                <div className="text-slate-500 text-[10px]">ĐẦU VÀO Ý TƯỞNG THÔ:</div>
                <div className="text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded">
                  "Website bán khóa học online có thi trắc nghiệm"
                </div>
                <div className="text-[#1D4ED8] text-[10px] pt-1">
                  ➔ XUẤT RA: 8 User Stories · 3 Schemas DB · Báo giá gợi ý chuẩn xác
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default FeaturesBento;
