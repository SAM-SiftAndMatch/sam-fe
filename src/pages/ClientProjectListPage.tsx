import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../api/job';
import AppHeader from '../components/AppHeader';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Footer from '../components/Footer';
import JobStatusBadge from '../components/JobStatusBadge';
import PaginationNav from '../components/PaginationNav';
import { usePageSearchParam } from '../hooks/usePageSearchParam';
import { PATH_CLIENT_PROJECT_DETAIL } from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';
import type { PageResult } from '../types/api';
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
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [page, setPage] = usePageSearchParam();
  const previousFilters = useRef({ filter, debouncedSearch: '' });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<JobResponse | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const loadRequestId = useRef(0);
  const backgroundAfterPageChange = useRef(false);

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

  const loadJobs = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (!isAuthenticated) return;
      const requestId = ++loadRequestId.current;
      if (background) {
        setIsLoading(false);
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setServerError(null);
      try {
        const result: PageResult<JobResponse> = await jobApi.getMyJobsPage({
          page,
          size: 10,
          status: filter === 'all' ? undefined : filter,
          search: debouncedSearch.trim() || undefined,
        });
        if (requestId !== loadRequestId.current) return;
        setJobs(result.items);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
      } catch (e) {
        if (requestId !== loadRequestId.current) return;
        if (axios.isAxiosError(e)) {
          const data = e.response?.data as { message?: string } | undefined;
          setServerError(data?.message || 'Không tải được danh sách dự án');
        } else {
          setServerError('Không tải được danh sách dự án');
        }
      } finally {
        if (requestId === loadRequestId.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [isAuthenticated, page, filter, debouncedSearch]
  );

  useEffect(() => {
    const background = backgroundAfterPageChange.current;
    backgroundAfterPageChange.current = false;
    void loadJobs({ background });
  }, [loadJobs]);

  const handleCancel = async () => {
    if (!cancelTarget || cancellingId) return;
    const jobId = cancelTarget.id;
    setCancellingId(jobId);
    setCancelError(null);
    try {
      const cancelledJob = await jobApi.cancelJob(jobId);
      loadRequestId.current += 1;
      setIsLoading(false);
      setIsRefreshing(false);
      setServerError(null);
      queryClient.setQueryData(['job', jobId], cancelledJob);
      setCancelTarget(null);
      if (filter === 'OPEN') {
        const nextTotal = Math.max(0, totalElements - 1);
        const nextTotalPages = Math.ceil(nextTotal / 10);
        setJobs((current) => current.filter((job) => job.id !== jobId));
        setTotalElements(nextTotal);
        setTotalPages(nextTotalPages);
        setIsRefreshing(true);
        if (page > Math.max(0, nextTotalPages - 1)) {
          backgroundAfterPageChange.current = true;
          setPage(Math.max(0, nextTotalPages - 1), true);
        } else {
          void loadJobs({ background: true });
        }
      } else {
        setJobs((current) => current.map((job) => (job.id === jobId ? cancelledJob : job)));
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        setCancelError(data?.message || 'Hủy dự án thất bại');
      } else {
        setCancelError('Hủy dự án thất bại');
      }
    } finally {
      setCancellingId(null);
    }
  };

  const filteredProjects = jobs;

  return (
    <div className="client-route min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <AppHeader />

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
          <p className="text-sm text-gray-500">
            Tổng {totalElements} dự án
            {isRefreshing && <span className="ml-2">Đang đồng bộ...</span>}
          </p>
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
                    <JobStatusBadge status={project.status} />
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
                      onClick={(event) => {
                        event.stopPropagation();
                        setCancelError(null);
                        setCancelTarget(project);
                      }}
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
          {!isLoading && !isRefreshing && filteredProjects.length === 0 && (
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
        <PaginationNav
          page={page + 1}
          totalPages={totalPages}
          onPageChange={(nextPage) => setPage(nextPage - 1)}
          label="Phân trang dự án của tôi"
        />
      </main>

      <Footer />
      <ConfirmDeleteModal
        isOpen={cancelTarget !== null}
        title="Xác nhận hủy dự án"
        message={`Bạn có chắc muốn hủy “${cancelTarget?.title ?? ''}”? Chỉ dự án đang mở mới có thể hủy.`}
        confirmText={cancellingId ? 'Đang hủy...' : 'Hủy dự án'}
        cancelText="Giữ dự án"
        error={cancelError}
        isPending={cancellingId !== null}
        onConfirm={() => void handleCancel()}
        onCancel={() => {
          setCancelTarget(null);
          setCancelError(null);
        }}
      />
    </div>
  );
};

export default ClientProjectListPage;
