import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobApi } from '../api/job';
import { proposalApi } from '../api/proposal';
import { storageApi } from '../api/storage';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import { extractApiResponse } from '../lib/api-error';
import { MINIMUM_PROJECT_BUDGET } from '../lib/participation-policy';
import { PATH_JOB_APPLY_SUCCESS } from '../routes/paths';

const ApplyJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJobById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });

  const [greeting, setGreeting] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!job) return;
    setProposedBudget((prev) => {
      if (prev) return prev;
      const defaultBudget = job.budgetMax ?? job.budgetMin ?? MINIMUM_PROJECT_BUDGET;
      return String(Math.max(MINIMUM_PROJECT_BUDGET, Number(defaultBudget)));
    });
    setEstimatedDays((prev) => {
      if (prev || !job.estimatedDurationMonths) return prev;
      return String(Math.max(1, Math.round(Number(job.estimatedDurationMonths) * 30)));
    });
  }, [job]);

  const showError = (msg: string) => {
    setServerError(msg);
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const formatBudget = (min?: number | null, max?: number | null): string => {
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <AppHeader />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy dự án</h2>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold border-0 cursor-pointer"
            >
              Quay lại
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handlePdfSelect = async (file: File | null) => {
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.doc') && !lower.endsWith('.docx')) {
      showError('Chỉ nhận file PDF/DOC/DOCX.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError('File tối đa 10MB.');
      return;
    }
    setPdfFile(file);
    setServerError(null);
    setIsUploading(true);
    try {
      const url = await storageApi.uploadFile(file);
      setPdfUrl(url);
    } catch {
      showError('Upload file thất bại, thử lại.');
      setPdfFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (job.status !== 'OPEN') {
      showError('Dự án đã đóng, không nhận hồ sơ nữa.');
      return;
    }
    if (isUploading) {
      showError('File đang tải lên, chờ xong rồi gửi.');
      return;
    }
    if (!greeting.trim()) {
      showError('Vui lòng viết vài lời chào giới thiệu với client.');
      return;
    }
    const parsedBudget = Number(proposedBudget.replaceAll('.', '').replaceAll(',', '').trim());
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      showError('Vui lòng nhập mức giá đề xuất hợp lệ.');
      return;
    }
    const parsedDays = estimatedDays.trim() ? Number(estimatedDays.trim()) : undefined;
    if (parsedDays !== undefined && (!Number.isInteger(parsedDays) || parsedDays <= 0)) {
      showError('Thời gian dự kiến phải là số ngày nguyên dương.');
      return;
    }
    setIsSubmitting(true);
    setServerError(null);
    try {
      await proposalApi.submit({
        jobId: job.id,
        coverLetter: greeting.trim(),
        proposedBudget: parsedBudget,
        estimatedDurationDays: parsedDays,
        attachmentUrl: pdfUrl || undefined,
        attachmentName: pdfFile?.name,
      });
      navigate(PATH_JOB_APPLY_SUCCESS.replace(':id', id || ''), {
        state: { isDraft: false },
      });
    } catch (err) {
      // Lỗi HTTP (409/400...): message tiếng Việt nằm trong body BE, phải moi ra —
      // err.message của axios chỉ là "Request failed with status code..."
      showError(
        extractApiResponse(err)?.message ||
          (err instanceof Error ? err.message : 'Nộp hồ sơ thất bại. Bạn có thể đã nộp rồi.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <AppHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {serverError && (
            <div
              ref={errorRef}
              role="alert"
              className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl text-center"
            >
              {serverError}
            </div>
          )}
          {job.status !== 'OPEN' && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium rounded-xl text-center">
              Dự án đã đóng tuyển, không nhận hồ sơ mới.
            </div>
          )}

          <div className="bg-white rounded-xl p-6 md:p-8 shadow-xs border border-slate-200/90">
            <span className="text-[10px] text-blue-600 uppercase tracking-widest block mb-2">
              {'//'} DỰ ÁN ỨNG TUYỂN
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <p className="text-sm font-bold text-[#1D4ED8]">
              Ngân sách: {formatBudget(job.budgetMin, job.budgetMax)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 md:p-8 shadow-xs border border-slate-200/90">
            <h3 className="text-sm font-bold text-gray-900 mb-1">CV / File proposal</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Đính kèm CV hoặc file proposal (PDF/DOC/DOCX, tối đa 10MB) để client xem cùng lời chào
              của bạn.
            </p>
            <label
              htmlFor="proposal-file"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-[#C7D7FE] bg-[#F8FAFC] text-sm font-bold text-[#1D4ED8] cursor-pointer hover:bg-blue-50 transition-colors"
            >
              {isUploading
                ? 'Đang tải file lên...'
                : pdfFile
                  ? `📎 ${pdfFile.name}`
                  : '📎 Chọn file CV / proposal'}
            </label>
            <input
              id="proposal-file"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => void handlePdfSelect(e.target.files?.[0] ?? null)}
            />
            {pdfUrl && (
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                ✓ Đã đính kèm file. Client sẽ xem được file này trong hồ sơ của bạn.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 md:p-8 shadow-xs border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="proposed-budget"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                Giá đề xuất (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                id="proposed-budget"
                type="number"
                min={100000}
                step={100000}
                value={proposedBudget}
                onChange={(e) => setProposedBudget(e.target.value)}
                placeholder="VD: 8000000"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Có thể đề xuất khác ngân sách khách hàng đưa ra để thương lượng.
              </p>
            </div>
            <div>
              <label
                htmlFor="estimated-days"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                Thời gian dự kiến (ngày)
              </label>
              <input
                id="estimated-days"
                type="number"
                min={1}
                step={1}
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                placeholder="VD: 14"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 md:p-8 shadow-xs border border-slate-200/90">
            <label htmlFor="greeting" className="block text-sm font-bold text-gray-900 mb-2">
              Lời chào / thư giới thiệu
            </label>
            <textarea
              id="greeting"
              rows={5}
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="Chào anh/chị, em là... Em có kinh nghiệm... Rất mong được hợp tác!"
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors resize-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploading || job.status !== 'OPEN'}
              className="group relative flex-1 h-[44px] bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg border-t border-t-blue-400/30 transition-all active:scale-[0.97] shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed btn-sweep"
            >
              <span>{isSubmitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ ứng tuyển'}</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default ApplyJobPage;
