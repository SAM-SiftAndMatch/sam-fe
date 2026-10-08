import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobApi } from '../api/job';
import { proposalApi } from '../api/proposal';
import { storageApi } from '../api/storage';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { extractApiResponse } from '../lib/api-error';
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

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
        <Header />
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
        <Header />
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
    setIsSubmitting(true);
    setServerError(null);
    try {
      await proposalApi.submit({
        jobId: job.id,
        coverLetter: greeting.trim(),
        proposedBudget: job.budgetMax ?? job.budgetMin ?? 0,
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
    <div className="min-h-screen bg-gradient-to-b from-[#EEF4FF] to-[#F8FAFC] font-sans flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {serverError && (
            <div
              ref={errorRef}
              className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-2xl text-center"
            >
              {serverError}
            </div>
          )}
          {job.status !== 'OPEN' && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium rounded-2xl text-center">
              Dự án đã đóng tuyển, không nhận hồ sơ mới.
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-[#E2E8F0]">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <p className="text-sm font-bold text-[#1D4ED8]">
              Ngân sách: {formatBudget(job.budgetMin, job.budgetMax)}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-gray-900 mb-1">CV / File proposal</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Đính kèm CV hoặc file proposal (PDF/DOC/DOCX, tối đa 10MB) để client xem cùng lời chào
              của bạn.
            </p>
            <label
              htmlFor="proposal-file"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-[#C7D7FE] bg-[#F8FAFC] text-sm font-bold text-[#1D4ED8] cursor-pointer hover:bg-blue-50 transition-colors"
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

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-[#E2E8F0]">
            <label htmlFor="greeting" className="block text-sm font-bold text-gray-900 mb-2">
              Lời chào / thư giới thiệu
            </label>
            <textarea
              id="greeting"
              rows={5}
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="Chào anh/chị, em là... Em có kinh nghiệm... Rất mong được hợp tác!"
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-sm text-gray-700 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors resize-none placeholder:text-gray-400"
            />
          </div>

          {serverError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-2xl text-center">
              {serverError}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploading || job.status !== 'OPEN'}
              className="flex-1 bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:opacity-95 text-white font-bold py-4 rounded-full transition-shadow shadow-md flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-60"
            >
              {isSubmitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ ứng tuyển'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default ApplyJobPage;
