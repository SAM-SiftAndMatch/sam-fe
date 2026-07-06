import type React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { PATH_CLIENT_POST_PROJECT, PATH_CLIENT_SUCCESS_PROJECT } from '../routes/paths';

const ConfirmProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <ClientDashboardHeader />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-100 w-full max-w-lg flex flex-col items-center text-center">
          {/* Icon Question */}
          <div className="w-20 h-20 rounded-full bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center mb-6 shadow-inner">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              role="img"
              aria-label="Question"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Bạn có chắc chắn muốn đăng dự án này?
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 px-4">
            Sau khi đăng, dự án sẽ được hiển thị cho freelancer trên nền tảng. Bạn có thể chỉnh sửa
            lại sau trong quản lý dự án.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 w-full mb-8">
            <button
              type="button"
              onClick={() => navigate(PATH_CLIENT_POST_PROJECT, { state: { ...state, restoreStep: 4 } })}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                role="img"
                aria-label="Back"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => {
                const newProject = {
                  id: 'new_' + Date.now(),
                  title: state.projectName || 'Dự án mới chưa đặt tên',
                  status: 'open',
                  budget: state.budgetAmount ? `${Number(state.budgetAmount).toLocaleString('vi-VN')} VND` : 'Thỏa thuận',
                  proposalsCount: 0,
                  createdAt: 'Vừa xong',
                  code: 'ID_SAM' + new Date().getFullYear(),
                  description: state.description || 'Chưa có mô tả chi tiết.',
                  skills: state.selectedSkills || [],
                  upgrades: state.upgrades || [],
                };
                
                const existing = JSON.parse(localStorage.getItem('SAM_USER_PROJECTS') || '[]');
                localStorage.setItem('SAM_USER_PROJECTS', JSON.stringify([newProject, ...existing]));

                navigate(PATH_CLIENT_SUCCESS_PROJECT, { state: { newProjectId: newProject.id } });
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold hover:opacity-90 shadow-md transition-opacity cursor-pointer text-sm border-0"
            >
              Xác nhận đăng dự án
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConfirmProjectPage;
