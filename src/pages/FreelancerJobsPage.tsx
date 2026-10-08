import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../api/job';
import Footer from '../components/Footer';
import Header from '../components/Header';
import * as paths from '../routes/paths';
import type { JobResponse } from '../types/job';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatBudget(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Thỏa thuận';
  const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) {
    if (min === max) return fmt(min);
    return `${fmt(min)} - ${fmt(max)}`;
  }
  if (min) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max!)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const JobCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
    <div className="flex gap-4">
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-14" />
        </div>
      </div>
      <div className="w-40 space-y-3">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
);

interface JobCardProps {
  job: JobResponse;
  onApply: (jobId: string) => void;
  onDetail: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onDetail }) => (
  <article
    onClick={() => onDetail(job.id)}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-400 hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] transition-all group cursor-pointer flex flex-col md:flex-row md:items-start gap-4"
    aria-label={`Job: ${job.title}`}
  >
    <div className="flex-1 min-w-0">
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {job.isUrgentHiring && (
          <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-md uppercase tracking-wide">
            Tuyển gấp
          </span>
        )}
        {job.isFeatured && (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
            Nổi bật
          </span>
        )}
        <span className="text-sm text-gray-400 font-medium">Đăng {timeAgo(job.createdAt)}</span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
        {job.title}
      </h3>

      {/* Description preview */}
      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{job.description}</p>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 5).map((skill) => (
            <span
              key={skill.id}
              className="text-xs text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 px-3 py-1 rounded-full transition-colors"
            >
              {skill.name}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-gray-50">
              +{job.skills.length - 5}
            </span>
          )}
        </div>
      )}
    </div>

    {/* Right panel */}
    <div className="md:w-48 shrink-0 flex flex-col md:items-end justify-between gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
      <div className="text-left md:text-right">
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Ngân sách</p>
        <p className="font-bold text-gray-900 text-sm leading-snug">
          {formatBudget(job.budgetMin, job.budgetMax)}
        </p>
        {job.estimatedDurationMonths && (
          <p className="text-xs text-gray-400 mt-1">~{job.estimatedDurationMonths} tháng</p>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onApply(job.id);
        }}
        className="w-full md:w-auto bg-gradient-to-r from-blue-700 to-sky-400 hover:shadow-[0_4px_15px_rgba(0,178,255,0.35)] text-white font-semibold py-2 px-6 rounded-full transition-all cursor-pointer border-0 text-sm whitespace-nowrap"
      >
        Ứng tuyển
      </button>
    </div>
  </article>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const FreelancerJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'budget_desc' | 'budget_asc'>('newest');

  const {
    data: jobs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['open-jobs'],
    queryFn: () => jobApi.getAllOpenJobs(),
    staleTime: 60_000, // 1 min cache
  });

  // Filter + sort
  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      const q = searchTerm.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.skills?.some((s) => s.name.toLowerCase().includes(q))
      );
    });

    if (sortBy === 'budget_desc') {
      result = [...result].sort(
        (a, b) => (b.budgetMax ?? b.budgetMin ?? 0) - (a.budgetMax ?? a.budgetMin ?? 0)
      );
    } else if (sortBy === 'budget_asc') {
      result = [...result].sort((a, b) => (a.budgetMin ?? 0) - (b.budgetMin ?? 0));
    }
    // 'newest' giữ nguyên thứ tự API trả về (đã sort createdAt DESC)

    return result;
  }, [jobs, searchTerm, sortBy]);

  const handleDetail = (jobId: string) => navigate(paths.PATH_JOB_DETAIL.replace(':id', jobId));
  const handleApply = (jobId: string) => navigate(paths.PATH_JOB_APPLY.replace(':id', jobId));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      {/* Hero Search Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-16 px-4 md:px-8 relative overflow-hidden border-b border-gray-100">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-800/10 to-transparent rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
            Tìm dự án phù hợp với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-400">
              kỹ năng
            </span>{' '}
            của bạn
          </h1>
          <p className="text-gray-500 mb-8 text-base md:text-lg">
            {isLoading ? 'Đang tải...' : `${jobs.length} dự án đang mở — mới nhất trước`}
          </p>

          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
            <div className="flex-1 w-full relative flex items-center">
              <svg
                className="w-5 h-5 text-gray-400 absolute left-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                id="job-search-input"
                type="text"
                placeholder="Tìm tên dự án, kỹ năng, công nghệ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none text-gray-800 placeholder:text-gray-400 text-base pl-12 pr-4 py-3 focus:outline-none focus:ring-0"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-0"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-700 to-sky-400 hover:shadow-[0_8px_25px_rgba(0,178,255,0.3)] text-white font-bold py-3 px-8 rounded-xl transition-all cursor-pointer border-0"
            >
              Tìm việc
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-10">
        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLoading
              ? 'Đang tải dự án...'
              : `${filteredJobs.length} dự án${searchTerm ? ` cho "${searchTerm}"` : ' mở'}`}
          </h2>
          <select
            id="job-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-none cursor-pointer"
          >
            <option value="newest">Mới nhất trước</option>
            <option value="budget_desc">Ngân sách: Cao → Thấp</option>
            <option value="budget_asc">Ngân sách: Thấp → Cao</option>
          </select>
        </div>

        {/* States */}
        {isError && (
          <div className="text-center py-20 bg-white rounded-2xl border border-red-100">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-gray-700 font-semibold mb-2">Không thể tải danh sách dự án</p>
            <p className="text-gray-400 text-sm mb-6">
              {error instanceof Error ? error.message : 'Lỗi không xác định'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors border-0 cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <JobCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        )}

        {!isLoading && !isError && filteredJobs.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-700 font-bold text-lg mb-2">
              {searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : 'Chưa có dự án nào'}
            </p>
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? 'Thử từ khóa khác hoặc xóa bộ lọc'
                : 'Quay lại sau nhé, các dự án mới sẽ sớm được đăng!'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-600 font-semibold hover:underline bg-transparent border-0 cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && filteredJobs.length > 0 && (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onDetail={handleDetail} onApply={handleApply} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerJobsPage;
