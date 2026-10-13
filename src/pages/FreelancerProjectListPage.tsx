import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../api/job';
import { paymentApi } from '../api/payment';
import { walletApi } from '../api/wallet';
import { workflowApi } from '../api/workflow';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import PaginationNav from '../components/PaginationNav';
import { usePageSearchParam } from '../hooks/usePageSearchParam';
import { PATH_WORKSPACE } from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';
import type { JobStatus } from '../types/job';
import type { FreelancerEscrowSummary } from '../types/payment';
import type { WalletSummary } from '../types/wallet';

type ProjectListStatus = 'preparing' | 'in_progress' | 'completed' | 'cancelled';

interface ProjectListItem {
  id: string;
  title: string;
  clientName: string;
  status: ProjectListStatus;
  budget: number;
  deadline: string;
  progress: number;
}

const toListStatus = (status: JobStatus): ProjectListStatus => {
  if (status === 'IN_PROGRESS') return 'in_progress';
  if (status === 'COMPLETED') return 'completed';
  if (status === 'CANCELLED') return 'cancelled';
  return 'preparing';
};

const FreelancerProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [page, setPage] = usePageSearchParam();
  const previousFilters = useRef({ filter, debouncedSearch: '' });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [escrow, setEscrow] = useState<FreelancerEscrowSummary | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (
      previousFilters.current.filter === filter &&
      previousFilters.current.debouncedSearch === debouncedSearch
    )
      return;
    previousFilters.current = { filter, debouncedSearch };
    setPage(0, true);
  }, [filter, debouncedSearch, setPage]);

  useEffect(() => {
    if (!user?.userId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      jobApi.getFreelancerProjectsPage(user.userId, {
        page,
        size: 10,
        group: filter === 'all' ? undefined : filter,
        search: debouncedSearch.trim() || undefined,
      }),
      paymentApi.getFreelancerEscrowSummary(user.userId),
      walletApi.getMyWallet(),
    ])
      .then(async ([jobPage, escrowData, walletData]) => {
        const mapped = await Promise.all(
          jobPage.items.map(async (job): Promise<ProjectListItem> => {
            let progress = job.status === 'COMPLETED' ? 100 : 0;
            if (job.status === 'IN_PROGRESS') {
              progress = await workflowApi
                .getTimelineSummary(job.id)
                .then((timeline) => timeline.progress)
                .catch(() => 0);
            }
            return {
              id: job.id,
              title: job.title,
              clientName: job.clientName,
              status: toListStatus(job.status),
              budget: Number(job.budgetMax ?? job.budgetMin ?? 0),
              deadline: job.deadline
                ? new Date(job.deadline).toLocaleDateString('vi-VN')
                : 'Chưa xác định',
              progress,
            };
          })
        );
        if (!cancelled) {
          setProjects(mapped);
          setTotalPages(jobPage.totalPages);
          setTotalElements(jobPage.totalElements);
          setEscrow(escrowData);
          setWallet(walletData);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không tải được dự án');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.userId, page, filter, debouncedSearch]);

  const filteredProjects = projects;

  const getStatusBadge = (project: ProjectListItem) => {
    switch (project.status) {
      case 'in_progress':
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Đang thực hiện
          </span>
        );
      case 'preparing':
        return (
          <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold border border-slate-200 w-fit">
            Đang chuẩn bị
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (val: number) => `${val.toLocaleString('vi-VN')} VND`;

  return (
    <div className="freelancer-route min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <AppHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dự án của tôi</h1>
          <p className="text-gray-500 text-sm">
            Quản lý và theo dõi tất cả các dự án bạn đang thực hiện
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#1D4ED8]"
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
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Tổng dự án
              </p>
              <p className="text-2xl font-black text-gray-900">{totalElements}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Ví thử nghiệm
              </p>
              <p className="text-xl font-black text-gray-900">
                {formatCurrency(wallet?.availableBalance ?? 0)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Đang ký quỹ
              </p>
              <p className="text-xl font-black text-gray-900">
                {formatCurrency(escrow?.heldForPayout ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

          <div className="relative w-full md:w-52 shrink-0">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all shadow-sm cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="preparing">Đang chuẩn bị</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
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

        {/* Project List */}
        <div className="flex flex-col gap-4">
          {loading && (
            <p className="text-sm text-gray-500 bg-white rounded-2xl border border-gray-100 p-5">
              Đang tải dự án và số tiền ký quỹ...
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-2xl border border-red-100 p-5">
              {error}
            </p>
          )}
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(PATH_WORKSPACE.replace(':projectId', project.id))}
              className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1 flex flex-col items-start gap-3">
                <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-4">
                  {getStatusBadge(project)}
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1D4ED8] transition-colors line-clamp-2">
                  {project.title}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Khách hàng: <span className="text-gray-600">{project.clientName}</span>
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 md:border-l md:border-gray-100 md:pl-8 pt-4 md:pt-0 border-t border-gray-50 md:border-t-0 w-full md:w-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Giá trị
                  </span>
                  <span className="text-sm font-bold text-[#1D4ED8]">
                    {formatCurrency(project.budget)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Deadline
                  </span>
                  <span className="text-sm font-bold text-gray-900">{project.deadline}</span>
                </div>
                {project.status === 'in_progress' && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Tiến độ
                    </span>
                    <span className="text-sm font-bold text-blue-600">{project.progress}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {!loading && filteredProjects.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-dashed border-gray-200">
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy dự án</h3>
              <p className="text-gray-500 text-sm">
                Không có dự án nào phù hợp với bộ lọc hiện tại.
              </p>
            </div>
          )}
        </div>
        <PaginationNav
          page={page + 1}
          totalPages={totalPages}
          onPageChange={(nextPage) => setPage(nextPage - 1)}
          label="Phân trang dự án freelancer"
        />
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerProjectListPage;
