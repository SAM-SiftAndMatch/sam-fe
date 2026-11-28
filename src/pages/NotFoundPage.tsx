import type React from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const homePath = !isAuthenticated
    ? paths.PATH_HOME
    : user?.role === 'FREELANCER'
      ? paths.PATH_FREELANCER
      : user?.role === 'ADMIN'
        ? '/admin'
        : paths.PATH_CLIENT_DASHBOARD;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1D4ED8] mb-2">Lỗi 404</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Không tìm thấy trang</h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Đường dẫn bạn truy cập không tồn tại hoặc tính năng này đã được chuyển sang không gian
            làm việc chính thức.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => navigate(homePath)}
              className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#153bb5] transition-colors cursor-pointer border-0"
            >
              Về trang chính
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFoundPage;
