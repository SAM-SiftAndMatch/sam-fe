import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../api/job';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import PaginationNav from '../components/PaginationNav';
import { usePageSearchParam } from '../hooks/usePageSearchParam';
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

const JOBS_PER_PAGE = 10;

// ─── Sub-components ──────────────────────────────────────────────────────────

const JobCardSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-[12px] border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
    <div className="flex gap-4">
      <div className="flex-1 space-y-3">
        <div className="h-3 w-1/4 rounded bg-slate-200" />
        <div className="h-6 w-3/4 rounded bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-[4px] bg-slate-200" />
          <div className="h-6 w-20 rounded-[4px] bg-slate-200" />
          <div className="h-6 w-14 rounded-[4px] bg-slate-200" />
        </div>
      </div>
      <div className="w-40 space-y-3">
        <div className="h-4 rounded bg-slate-200" />
        <div className="h-10 rounded-[8px] bg-slate-200" />
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
    className="group flex cursor-pointer flex-col gap-5 rounded-[12px] border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1D4ED8]/60 hover:shadow-[0_8px_24px_rgba(29,78,216,0.08)] md:flex-row md:items-start"
    aria-label={`Job: ${job.title}`}
  >
    <div className="min-w-0 flex-1">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {job.isUrgentHiring && (
          <span className="rounded-[4px] bg-red-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-white">
            Tuyển gấp
          </span>
        )}
        {job.isFeatured && (
          <span className="rounded-[4px] bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-amber-700">
            Nổi bật
          </span>
        )}
        <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Đăng {timeAgo(job.createdAt)}
        </span>
      </div>

      <h3 className="mb-3 line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-[#1D4ED8]">
        {job.title}
      </h3>
      <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-slate-600">{job.description}</p>

      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map((skill) => (
            <span
              key={skill.id}
              className="rounded-[4px] bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-600 transition-colors group-hover:bg-[#1D4ED8]/[0.05] group-hover:text-[#1D4ED8]"
            >
              {skill.name}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="rounded-[4px] bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-400">
              +{job.skills.length - 5}
            </span>
          )}
        </div>
      )}
    </div>

    <div className="flex shrink-0 flex-col justify-between gap-5 border-t border-slate-100 pt-5 md:w-52 md:items-end md:border-t-0 md:border-l md:pl-6 md:pt-0">
      <div className="text-left md:text-right">
        <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Ngân sách
        </p>
        <p className="text-sm font-bold leading-snug text-slate-900">
          {formatBudget(job.budgetMin, job.budgetMax)}
        </p>
        {job.estimatedDurationMonths && (
          <p className="mt-1 font-mono text-[10px] text-slate-400">
            ~{job.estimatedDurationMonths} tháng
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onApply(job.id);
        }}
        className="w-full whitespace-nowrap rounded-[8px] border-0 bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#153BB5] md:w-auto"
      >
        Ứng tuyển
      </button>
    </div>
  </article>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const FreelancerJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projectQuery, setProjectQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillQuery, setCustomSkillQuery] = useState('');
  const [isCustomSkillSearchOpen, setIsCustomSkillSearchOpen] = useState(false);
  const [budgetFilter, setBudgetFilter] = useState<
    'all' | 'under_5m' | 'from_5m_to_20m' | 'over_20m' | 'negotiable'
  >('all');
  const [sortBy, setSortBy] = useState<'newest' | 'budget_desc' | 'budget_asc'>('newest');
  const [page, setPage] = usePageSearchParam();
  const currentPage = page + 1;
  const filterKey = JSON.stringify([
    projectQuery,
    selectedSkills,
    customSkillQuery,
    budgetFilter,
    sortBy,
  ]);
  const previousFilterKey = useRef(filterKey);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(projectQuery), 300);
    return () => window.clearTimeout(timer);
  }, [projectQuery]);

  const {
    data: jobPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'open-jobs-page',
      currentPage,
      debouncedQuery,
      selectedSkills,
      customSkillQuery,
      budgetFilter,
      sortBy,
    ],
    queryFn: () =>
      jobApi.getOpenJobsPage({
        page: currentPage - 1,
        size: JOBS_PER_PAGE,
        search: debouncedQuery.trim() || undefined,
        skillNames: selectedSkills.join(',') || undefined,
        customSkill: customSkillQuery.trim() || undefined,
        negotiable: budgetFilter === 'negotiable',
        minBudget:
          budgetFilter === 'from_5m_to_20m'
            ? 5_000_000
            : budgetFilter === 'over_20m'
              ? 20_000_001
              : undefined,
        maxBudget:
          budgetFilter === 'under_5m'
            ? 4_999_999
            : budgetFilter === 'from_5m_to_20m'
              ? 20_000_000
              : undefined,
        sort: sortBy,
      }),
    staleTime: 60_000, // 1 min cache
  });
  const jobs = jobPage?.items ?? [];

  const popularSkills = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const job of jobs) {
      for (const skill of job.skills) {
        const key = skill.name.trim().toLowerCase();
        const existing = counts.get(key);
        counts.set(key, {
          name: skill.name,
          count: (existing?.count ?? 0) + 1,
        });
      }
    }
    return [...counts.values()]
      .sort((first, second) => second.count - first.count)
      .slice(0, 8)
      .map((skill) => skill.name);
  }, [jobs]);

  const filteredJobs = jobs;

  useEffect(() => {
    if (previousFilterKey.current === filterKey) return;
    previousFilterKey.current = filterKey;
    setPage(0, true);
  }, [filterKey, setPage]);

  useEffect(() => {
    if (!jobPage || currentPage <= Math.max(1, jobPage.totalPages)) return;
    setPage(Math.max(0, jobPage.totalPages - 1), true);
  }, [currentPage, jobPage, setPage]);

  const totalPages = Math.max(1, jobPage?.totalPages ?? 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedJobs = filteredJobs;

  const handleDetail = (jobId: string) => navigate(paths.PATH_JOB_DETAIL.replace(':id', jobId));
  const handleApply = (jobId: string) => navigate(paths.PATH_JOB_APPLY.replace(':id', jobId));
  const hasFilters = Boolean(
    projectQuery || selectedSkills.length > 0 || customSkillQuery || budgetFilter !== 'all'
  );
  const clearFilters = () => {
    setProjectQuery('');
    setSelectedSkills([]);
    setCustomSkillQuery('');
    setIsCustomSkillSearchOpen(false);
    setBudgetFilter('all');
  };
  const togglePopularSkill = (skill: string) => {
    setSelectedSkills((currentSkills) =>
      currentSkills.some((currentSkill) => currentSkill.toLowerCase() === skill.toLowerCase())
        ? currentSkills.filter((currentSkill) => currentSkill.toLowerCase() !== skill.toLowerCase())
        : [...currentSkills, skill]
    );
  };
  const goToPage = (page: number) => {
    setPage(Math.max(1, Math.min(page, totalPages)) - 1);
    document.getElementById('job-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="freelancer-route flex min-h-screen flex-col bg-[#F8FAFC] font-sans">
      <AppHeader />

      {/* Hero Search Section */}
      <section className="freelancer-jobs-hero relative overflow-hidden border-b border-slate-200/80 bg-[#F8FAFC] px-4 py-12 md:px-8 md:py-14">
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 -translate-y-1/2 translate-x-1/3 rounded-full bg-[#1D4ED8]/[0.04]" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Tìm dự án phù hợp với <span className="text-[#1D4ED8]">kỹ năng</span> của bạn
          </h1>

          <p className="mb-7 text-sm text-slate-600 md:text-base">
            Khám phá dự án phù hợp và kết nối với khách hàng ngay hôm nay.
          </p>
          <div className="mx-auto flex max-w-3xl gap-3">
            <label className="group flex h-11 min-w-0 flex-1 items-center gap-2 rounded-[8px] border border-slate-200/90 bg-white px-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-colors focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/10">
              <svg
                className="h-4 w-4 shrink-0 text-slate-400 group-focus-within:text-[#1D4ED8]"
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
                id="job-project-search-input"
                type="text"
                placeholder="Tìm theo tên hoặc mô tả dự án..."
                value={projectQuery}
                onChange={(e) => setProjectQuery(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-0"
              />
            </label>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById('job-results')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="h-11 shrink-0 cursor-pointer rounded-[8px] border-0 bg-[#1D4ED8] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#153BB5]"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-3 py-10 md:px-5">
        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[12px] border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:sticky lg:top-24 lg:mt-[68px]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Bộ lọc tìm việc</h2>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold text-[#1D4ED8] transition-colors hover:text-[#153BB5]"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="border-b border-slate-100 pb-5">
              <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Kỹ năng / công nghệ
              </p>
              <div>
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Chọn một hoặc nhiều kỹ năng
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {popularSkills.map((skill) => {
                    const isSelected = selectedSkills.some(
                      (selectedSkill) => selectedSkill.toLowerCase() === skill.toLowerCase()
                    );
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => togglePopularSkill(skill)}
                        className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                          isSelected
                            ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-[#1D4ED8]/50 hover:text-[#1D4ED8]'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsCustomSkillSearchOpen((isOpen) => !isOpen)}
                    className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                      isCustomSkillSearchOpen
                        ? 'border-[#1D4ED8] bg-[#1D4ED8]/[0.06] text-[#1D4ED8]'
                        : 'border-dashed border-slate-300 bg-white text-slate-500 hover:border-[#1D4ED8]/50 hover:text-[#1D4ED8]'
                    }`}
                  >
                    + Khác
                  </button>
                </div>
              </div>
              {isCustomSkillSearchOpen && (
                <label className="group mt-3 flex items-center gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2.5 transition-colors focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/10">
                  <svg
                    className="h-4 w-4 shrink-0 text-slate-400 group-focus-within:text-[#1D4ED8]"
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
                    type="text"
                    placeholder="Nhập kỹ năng khác..."
                    value={customSkillQuery}
                    onChange={(event) => setCustomSkillQuery(event.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-0"
                    aria-label="Tìm theo kỹ năng khác"
                  />
                </label>
              )}
            </div>

            <fieldset className="pt-5">
              <legend className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Ngân sách dự án
              </legend>
              <div className="space-y-1">
                {[
                  { value: 'all', label: 'Mọi mức giá' },
                  { value: 'under_5m', label: 'Dưới 5 triệu' },
                  { value: 'from_5m_to_20m', label: 'Từ 5 đến 20 triệu' },
                  { value: 'over_20m', label: 'Trên 20 triệu' },
                  { value: 'negotiable', label: 'Thỏa thuận' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-[6px] px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-[#1D4ED8]/[0.05] hover:text-[#1D4ED8]"
                  >
                    <input
                      type="radio"
                      name="job-budget-filter"
                      value={option.value}
                      checked={budgetFilter === option.value}
                      onChange={() => setBudgetFilter(option.value as typeof budgetFilter)}
                      className="h-4 w-4 border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </aside>

          <div className="min-w-0">
            {/* Toolbar */}
            <div
              id="job-results"
              className="mb-6 flex scroll-mt-24 flex-wrap items-center justify-between gap-4"
            >
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {isLoading
                  ? 'Đang tải dự án...'
                  : hasFilters
                    ? `Có ${jobPage?.totalElements ?? 0} dự án phù hợp`
                    : `Có ${jobPage?.totalElements ?? 0} dự án đã được đăng`}
              </h2>
              <div className="flex items-center gap-3">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="cursor-pointer border-0 bg-transparent px-2 py-2 text-sm font-semibold text-[#1D4ED8] transition-colors hover:text-[#153BB5]"
                  >
                    Xóa bộ lọc
                  </button>
                )}
                <select
                  id="job-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="block cursor-pointer rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1D4ED8] focus:ring-[#1D4ED8]"
                >
                  <option value="newest">Mới nhất trước</option>
                  <option value="budget_desc">Ngân sách: Cao → Thấp</option>
                  <option value="budget_asc">Ngân sách: Thấp → Cao</option>
                </select>
              </div>
            </div>

            {/* States */}
            {isError && (
              <div className="rounded-[12px] border border-red-100 bg-white py-20 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-gray-700 font-semibold mb-2">Không thể tải danh sách dự án</p>
                <p className="text-gray-400 text-sm mb-6">
                  {error instanceof Error ? error.message : 'Lỗi không xác định'}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="cursor-pointer rounded-[8px] border-0 bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#153BB5]"
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
              <div className="rounded-[12px] border border-slate-200/90 bg-white py-24 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-700 font-bold text-lg mb-2">
                  {hasFilters ? 'Không tìm thấy dự án phù hợp' : 'Chưa có dự án nào'}
                </p>
                <p className="text-gray-400 text-sm">
                  {hasFilters
                    ? 'Thử từ khóa khác hoặc xóa bộ lọc'
                    : 'Quay lại sau nhé, các dự án mới sẽ sớm được đăng!'}
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 cursor-pointer border-0 bg-transparent font-semibold text-[#1D4ED8] hover:underline"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            )}

            {!isLoading && !isError && filteredJobs.length > 0 && (
              <div className="space-y-4">
                {paginatedJobs.map((job) => (
                  <JobCard key={job.id} job={job} onDetail={handleDetail} onApply={handleApply} />
                ))}
              </div>
            )}
            {!isLoading && !isError && (jobPage?.totalPages ?? 0) > 0 && (
              <PaginationNav
                page={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                label="Phân trang dự án"
                className="mt-8"
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerJobsPage;
