import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as paths from '../../routes/paths';
import { PolicyButton } from '../PolicyLinks';
import SamBrandLogo from '../SamBrandLogo';

type InfoGuide = 'escrow' | 'qa' | null;

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [guide, setGuide] = useState<InfoGuide>(null);

  useEffect(() => {
    if (!guide) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGuide(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [guide]);

  const goSection = (sectionId: string) => {
    if (location.pathname === paths.PATH_HOME || location.pathname === paths.PATH_HOME_ALT) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate(`${paths.PATH_HOME}#${sectionId}`);
  };

  return (
    <footer className="w-full bg-white border-t border-slate-200/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
          {/* Cột 1: Logo & Giới thiệu */}
          <div className="flex flex-col items-start col-span-1">
            <Link
              to={paths.PATH_HOME}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 mb-3 group"
            >
              <SamBrandLogo />
            </Link>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
              Nền tảng kết nối nhân tài hàng đầu Việt Nam ứng dụng trí tuệ nhân tạo để thẩm định và
              bảo vệ chất lượng dự án.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-[4px] border border-slate-200">
                SYSTEM: ALL OPERATIONAL
              </span>
            </div>
          </div>

          {/* Cột 2: Dành cho Khách hàng */}
          <div className="flex flex-col items-start col-span-1">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Dành cho Khách hàng
            </h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-slate-600">
              <Link
                to={paths.PATH_CLIENT_AI_BRIEF}
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Tạo yêu cầu AI Brief
              </Link>
              <Link
                to={paths.PATH_CLIENT_POST_PROJECT}
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Đăng dự án mới
              </Link>
              <Link
                to={paths.PATH_CLIENT_PRICING}
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Bảng giá dịch vụ
              </Link>
              <Link
                to={paths.PATH_CLIENT_FIND_FREELANCER}
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Tìm kiếm Freelancer
              </Link>
            </div>
          </div>

          {/* Cột 3: Về SAM */}
          <div className="flex flex-col items-start col-span-1">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Về SAM
            </h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-slate-600">
              <button
                type="button"
                onClick={() => goSection('hero')}
                className="text-left bg-transparent border-0 p-0 cursor-pointer hover:text-[#1D4ED8] transition-colors"
              >
                Tổng quan nền tảng
              </button>
              <button
                type="button"
                onClick={() => goSection('process')}
                className="text-left bg-transparent border-0 p-0 cursor-pointer hover:text-[#1D4ED8] transition-colors"
              >
                Quy trình kiểm định AI QC
              </button>
              <button
                type="button"
                onClick={() => goSection('features')}
                className="text-left bg-transparent border-0 p-0 cursor-pointer hover:text-[#1D4ED8] transition-colors"
              >
                Công nghệ cốt lõi
              </button>
              <Link to={paths.PATH_FREELANCER} className="hover:text-[#1D4ED8] transition-colors">
                Dành cho Freelancer
              </Link>
            </div>
          </div>

          {/* Cột 4: Chính sách & Pháp lý */}
          <div className="flex flex-col items-start col-span-1">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Chính sách & An toàn
            </h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-slate-600">
              <PolicyButton policy="terms" className="hover:text-[#1D4ED8] transition-colors">
                Điều khoản dịch vụ
              </PolicyButton>
              <PolicyButton policy="privacy" className="hover:text-[#1D4ED8] transition-colors">
                Chính sách bảo mật
              </PolicyButton>
              <button
                type="button"
                onClick={() => setGuide('escrow')}
                className="text-left bg-transparent border-0 p-0 cursor-pointer hover:text-[#1D4ED8] transition-colors"
              >
                Cơ chế Ký quỹ Escrow
              </button>
              <button
                type="button"
                onClick={() => setGuide('qa')}
                className="text-left bg-transparent border-0 p-0 cursor-pointer hover:text-[#1D4ED8] transition-colors"
              >
                Checklist nghiệm thu
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© 2026 SAM AI Marketplace. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>
              AI PM {'//'} AI MATCHING {'//'} AI QC
            </span>
          </div>
        </div>
      </div>

      {guide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setGuide(null);
          }}
        >
          <dialog
            open
            aria-modal="true"
            aria-label={guide === 'escrow' ? 'Cơ chế Ký quỹ Escrow' : 'Checklist nghiệm thu'}
            className="relative m-0 w-full max-w-lg rounded-2xl border-0 bg-white p-6 text-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {guide === 'escrow'
                  ? 'Cơ chế Ký quỹ Escrow tại SAM'
                  : 'Checklist nghiệm thu & Bảo trì 7 ngày'}
              </h3>
              <button
                type="button"
                onClick={() => setGuide(null)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
            {guide === 'escrow' ? (
              <ul className="space-y-2.5 text-sm text-slate-600 leading-relaxed list-disc list-inside">
                <li>
                  Sau khi hai bên ký hợp đồng, Khách hàng nạp <strong>100% giá trị hợp đồng</strong>{' '}
                  vào tài khoản ký quỹ an toàn trên SAM qua cổng thanh toán Pay2S.
                </li>
                <li>
                  Freelancer đóng <strong>2% tiền cọc cam kết</strong> tiến độ; khoản cọc này sẽ
                  được hoàn lại đầy đủ cùng 90% thù lao sau khi nghiệm thu và hết 7 ngày bảo trì.
                </li>
                <li>
                  Tiền chỉ được giải phóng khi Khách hàng xác nhận nghiệm thu sản phẩm và không còn
                  ticket bảo trì đang mở.
                </li>
              </ul>
            ) : (
              <ul className="space-y-2.5 text-sm text-slate-600 leading-relaxed list-disc list-inside">
                <li>
                  Khi Freelancer nộp bản bàn giao (kèm link demo/repository), SAM tự động sinh{' '}
                  <strong>Checklist QA thủ công</strong> bám sát tài liệu SRS để Khách hàng kiểm tra
                  từng hạng mục.
                </li>
                <li>
                  Khách hàng có quyền yêu cầu chỉnh sửa nếu chưa đạt hoặc bấm nghiệm thu để chốt bàn
                  giao.
                </li>
                <li>
                  Sau nghiệm thu, dự án bước vào <strong>168 giờ (7 ngày) bảo trì kỹ thuật</strong>{' '}
                  cho các lỗi phát sinh trong phạm vi đã thống nhất.
                </li>
              </ul>
            )}
          </dialog>
        </div>
      )}
    </footer>
  );
};

export default LandingFooter;
