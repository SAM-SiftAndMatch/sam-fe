import type React from 'react';
import { Link } from 'react-router-dom';
import * as paths from '../../routes/paths';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
          {/* Cột 1: Logo & Giới thiệu */}
          <div className="flex flex-col items-start col-span-1">
            <Link
              to={paths.PATH_HOME}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 mb-3"
            >
              <span className="text-2xl font-black tracking-tight text-[#1D4ED8]">SAM</span>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                SIFT & MATCH
              </span>
            </Link>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
              Nền tảng kết nối nhân tài hàng đầu Việt Nam ứng dụng trí tuệ nhân tạo để thẩm định và
              bảo vệ chất lượng dự án.
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-[4px] border border-slate-200">
                SYSTEM: ALL OPERATIONAL
              </span>
            </div>
          </div>

          {/* Cột 2: Dành cho Khách hàng */}
          <div className="flex flex-col items-start col-span-1">
            <h4 className="text-xs font-mono font-semibold text-slate-900 uppercase tracking-wider mb-4">
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

          {/* Cột 3: Về chúng tôi */}
          <div className="flex flex-col items-start col-span-1">
            <h4 className="text-xs font-mono font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Về SAM
            </h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-slate-600">
              <a href="#hero" className="hover:text-[#1D4ED8] transition-colors">
                Tổng quan nền tảng
              </a>
              <a href="#process" className="hover:text-[#1D4ED8] transition-colors">
                Quy trình kiểm định AI QC
              </a>
              <a href="#features" className="hover:text-[#1D4ED8] transition-colors">
                Công nghệ cốt lõi
              </a>
              <Link to={paths.PATH_FREELANCER} className="hover:text-[#1D4ED8] transition-colors">
                Dành cho Freelancer
              </Link>
            </div>
          </div>

          {/* Cột 4: Chính sách & Pháp lý */}
          <div className="flex flex-col items-start col-span-1">
            <h4 className="text-xs font-mono font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Chính sách & An toàn
            </h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-slate-600">
              <a href="#" className="hover:text-[#1D4ED8] transition-colors">
                Điều khoản dịch vụ
              </a>
              <a href="#" className="hover:text-[#1D4ED8] transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="hover:text-[#1D4ED8] transition-colors">
                Cơ chế Ký quỹ Escrow
              </a>
              <a href="#" className="hover:text-[#1D4ED8] transition-colors">
                Tiêu chuẩn AI Trọng tài
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>© 2026 SAM AI Marketplace. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>
              AI PM {'//'} AI MATCHING {'//'} AI QC
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
