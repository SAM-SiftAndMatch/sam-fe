import axios from 'axios';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../api/job';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { PATH_CLIENT_PROJECT_DETAIL } from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';
import type { JobResponse } from '../types/job';
import { formatDate, formatMoney } from '../utils/format';

type FilterKey =
  | 'all'
  | 'OPEN'
  | 'NEGOTIATING'
  | 'AWAITING_PAYMENT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

const ClientProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setServerError(null);
    try {
      setJobs(await jobApi.getMyJobs());
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { message?: string } | undefined;
        setServerError(data?.message || 'Không tải được danh sách dự án');
      } else {
        setServerError('Không tải được danh sách dự án');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const handleCancel = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (!window.confirm('Hủy dự án này? Chỉ dự án đang mở mới hủy được.')) return;
    setCancellingId(jobId);
    try {
      await jobApi.cancelJob(jobId);
      await loadJobs();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        setServerError(data?.message || 'Hủy dự án thất bại');
      } else {
        setServerError('Hủy dự án thất bại');
      }
    } finally {
      setCancellingId(null);
    }
  };

  const filteredProjects = jobs
    .filter((p) => {
      const matchFilter = filter === 'all' || p.status === filter;
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      if (a.status === 'CANCELLED' && b.status !== 'CANCELLED') return 1;
      if (a.status !== 'CANCELLED' && b.status === 'CANCELLED') return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Đang chờ đề xuất
          </span>
        );
      case 'NEGOTIATING':
        return (
          <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-bold border border-yellow-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
            Đang thương lượng
          </span>
        );
      case 'AWAITING_PAYMENT':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            Chờ nạp tiền
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold border border-orange-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
            Đang thực hiện
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Đã hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <ClientDashboardHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản lý dự án</h1>
            <p className="text-gray-500 text-sm">
              Xem và quản lý tất cả các yêu cầu công việc của bạn
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm dự án..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all shadow-sm"
              />
            </div>

            {/* Filters */}
            <div className="relative w-full md:w-48 shrink-0">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterKey)}
                className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all shadow-sm cursor-pointer"
              >
                {[
                  { id: 'all', label: 'Tất cả trạng thái' },
                  { id: 'OPEN', label: 'Đang chờ' },
                  { id: 'NEGOTIATING', label: 'Đang thương lượng' },
                  { id: 'AWAITING_PAYMENT', label: 'Chờ nạp tiền' },
                  { id: 'IN_PROGRESS', label: 'Đang thực hiện' },
                  { id: 'COMPLETED', label: 'Hoàn thành' },
                  { id: 'CANCELLED', label: 'Đã hủy' },
                ].map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Project List */}
        {serverError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {serverError}
          </div>
        )}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <p className="text-sm text-gray-500 text-center py-10">Đang tải dự án...</p>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(PATH_CLIENT_PROJECT_DETAIL.replace(':id', project.id))}
                className={`bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  project.status === 'CANCELLED' ? 'opacity-60 grayscale-[0.5]' : ''
                }`}
              >
                {/* Cột trái: Tên & Trạng thái */}
                <div className="flex-1 flex flex-col items-start gap-3">
                  <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-4">
                    {getStatusBadge(project.status)}
                    <span className="text-xs font-semibold text-gray-400 md:hidden">
                      {formatDate(project.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1D4ED8] transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                </div>

                {/* Cột phải: Ngân sách & Hạn chót */}
                <div className="flex items-center justify-between md:justify-end gap-8 md:border-l md:border-gray-100 md:pl-8 pt-4 md:pt-0 border-t border-gray-50 md:border-t-0 w-full md:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Ngân sách
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {project.budgetMin === project.budgetMax || !project.budgetMax
                        ? formatMoney(project.budgetMin)
                        : `${formatMoney(project.budgetMin)} – ${formatMoney(project.budgetMax)}`}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Hạn chót
                    </span>
                    <span className="text-sm font-bold text-[#1D4ED8]">
                      {project.deadline ? formatDate(project.deadline) : 'Chưa có'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 hidden md:block w-24 text-right">
                    {formatDate(project.createdAt)}
                  </span>
                  {project.status === 'OPEN' && (
                    <button
                      type="button"
                      onClick={(e) => void handleCancel(e, project.id)}
                      disabled={cancellingId === project.id}
                      className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer bg-transparent border-0 disabled:opacity-60 shrink-0"
                    >
                      {cancellingId === project.id ? 'Đang hủy...' : 'Hủy'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {!isLoading && filteredProjects.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-20 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có dự án nào</h3>
              <p className="text-gray-500 text-sm">
                Không tìm thấy dự án nào trong trạng thái này.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientProjectListPage;
