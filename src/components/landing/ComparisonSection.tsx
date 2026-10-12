import type React from 'react';
import { MonoTag } from './LandingButtons';
import { ScrollReveal } from './ScrollReveal';

interface ComparisonRow {
  aspect: string;
  traditional: string;
  sam: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    aspect: 'Lập yêu cầu dự án',
    traditional:
      'Khách tự viết mô tả sơ sài, mơ hồ. Mất nhiều ngày chat qua lại vẫn chưa chốt được thông số kỹ thuật.',
    sam: 'AI PM phỏng vấn chuyên sâu, tự động xuất tài liệu SRS chuẩn xác và báo giá tối ưu chỉ trong 30 giây.',
  },
  {
    aspect: 'Tìm kiếm & Ghép đôi',
    traditional:
      'Tự duyệt hàng chục hồ sơ xin việc, báo giá ảo, rủi ro tài khoản phóng đại năng lực, mất 3 - 7 ngày.',
    sam: 'AI Matching quét danh mục portfolio, commit mã nguồn thực tế và kết nối đúng nhân tài với độ chính xác 99%.',
  },
  {
    aspect: 'Kiểm soát chất lượng',
    traditional:
      'Khách hàng tự test thủ công, dễ nhận về mã nguồn rác, lỗi tiềm ẩn, không có bảo chứng chất lượng.',
    sam: 'AI QC tự động phân tích tĩnh (Static Analysis), quét lỗ hổng bảo mật và kiểm tra đạo văn trước khi bàn giao.',
  },
  {
    aspect: 'Phát sinh phạm vi (Scope)',
    traditional:
      'Tranh cãi không hồi kết do không rõ ràng ranh giới công việc ban đầu, dẫn đến dự án chậm trễ hoặc đổ vỡ.',
    sam: 'Lá chắn Scope Shield tự động đối chiếu yêu cầu mới với bản brief gốc, đề xuất milestone bổ sung minh bạch.',
  },
  {
    aspect: 'Ký quỹ & Thanh toán',
    traditional:
      'Chuyển tiền trực tiếp rủi ro, hoặc quy trình hòa giải thủ công của sàn kéo dài cả tháng trời.',
    sam: 'Ký quỹ Escrow bảo vệ 100% ngân sách, tự động giải ngân theo cột mốc khi AI QC xác nhận đạt chuẩn.',
  },
];

export const ComparisonSection: React.FC = () => {
  return (
    <section
      id="comparison"
      className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative"
    >
      <ScrollReveal className="text-left mb-14">
        <div className="flex items-center gap-2 mb-3">
          <MonoTag variant="primary">ĐỐI CHIẾU THỊ TRƯỜNG {'//'} BENCHMARK</MonoTag>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          So với chợ freelance truyền thống
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Đưa tự động hóa và AI vào thẩm định kỹ thuật giúp cả khách hàng và lập trình viên tiết
          kiệm thời gian, loại bỏ rủi ro tranh chấp và bảo vệ ngân sách tối đa.
        </p>
      </ScrollReveal>

      {/* Two-Column Comparison Table */}
      <ScrollReveal>
        <div className="w-full bg-white rounded-[12px] border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Table Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-200/90 bg-slate-50/70">
            <div className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-slate-200/90 flex flex-col justify-center">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider block mb-1">
                TRUYỀN THỐNG
              </span>
              <h3 className="text-lg font-bold text-slate-700">Chợ Freelance Truyền Thống</h3>
              <p className="text-xs text-slate-500 mt-1">Nhiều thao tác thủ công, rủi ro tự chịu</p>
            </div>

            <div className="p-5 sm:p-6 bg-[#1D4ED8]/[0.03] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] text-[#1D4ED8] uppercase tracking-wider font-semibold">
                  NỀN TẢNG THẾ HỆ MỚI
                </span>
                <MonoTag variant="primary">AI-POWERED</MonoTag>
              </div>
              <h3 className="text-lg font-bold text-[#1D4ED8]">SAM (Sift And Match)</h3>
              <p className="text-xs text-slate-600 mt-1">
                Quy trình tự động hóa, kiểm định AI QC toàn diện
              </p>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-200/70">
            {COMPARISON_DATA.map((row) => (
              <div
                key={row.aspect}
                className="grid grid-cols-1 md:grid-cols-2 hover:bg-slate-50/40 transition-colors"
              >
                {/* Left Column: Traditional */}
                <div className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-slate-200/70 flex flex-col justify-start">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-4 h-4 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">
                      ✕
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-800 uppercase tracking-wider">
                      {row.aspect}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pl-6">
                    {row.traditional}
                  </p>
                </div>

                {/* Right Column: SAM */}
                <div className="p-5 sm:p-6 bg-[#1D4ED8]/[0.015] flex flex-col justify-start">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">
                      ✓
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#1D4ED8] uppercase tracking-wider">
                      {row.aspect}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed pl-6">
                    {row.sam}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default ComparisonSection;
