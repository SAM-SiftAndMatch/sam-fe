import type React from 'react';
import * as paths from '../../routes/paths';
import { MonoTag, PrimaryButton, SecondaryButton } from './LandingButtons';
import { ScrollReveal } from './ScrollReveal';

export const CtaBand: React.FC = () => {
  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
      <ScrollReveal>
        <div className="w-full bg-white rounded-[12px] p-8 sm:p-12 lg:p-16 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col items-start text-left relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <MonoTag variant="primary">BẮT ĐẦU NGAY {'//'} KHỞI TẠO DỰ ÁN</MonoTag>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4 max-w-2xl">
            Bắt đầu thuê đúng Freelancer ngay hôm nay
          </h2>

          <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-2xl leading-relaxed">
            Đăng ký tài khoản doanh nghiệp miễn phí và trải nghiệm sức mạnh của AI trong việc tuyển
            dụng nhân tài và kiểm định chất lượng sản phẩm trước khi bàn giao.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-6">
            <PrimaryButton to={paths.PATH_CLIENT_AI_BRIEF}>Đăng dự án miễn phí</PrimaryButton>
            <SecondaryButton to={paths.PATH_FREELANCER}>Tìm việc Freelance</SecondaryButton>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-mono">
            <span>✓ Miễn phí tạo đặc tả SRS</span>
            <span>✓ Ký quỹ Escrow an toàn</span>
            <span>✓ Bảo chứng chất lượng bởi AI QC</span>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default CtaBand;
