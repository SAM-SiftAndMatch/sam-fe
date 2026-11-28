import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { jobApi } from '../api/job';

type Props = { jobId: string; compact?: boolean };

export default function SrsPdfActions({ jobId, compact = false }: Props) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const status = useQuery({
    queryKey: ['job-srs-pdf', jobId],
    queryFn: () => jobApi.getSrsPdfStatus(jobId),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const value = query.state.data;
      return value &&
        (value.status === 'READY' || (value.status === 'FAILED' && value.attempts >= 5))
        ? false
        : 10_000;
    },
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!previewUrl) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewUrl(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewUrl]);

  const openPdf = async (download: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const blob = await jobApi.getSrsPdf(jobId, download);
      const url = URL.createObjectURL(blob);
      if (download) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `srs-${jobId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      }
    } catch {
      setError('Không mở được PDF. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const retry = async () => {
    setBusy(true);
    setError(null);
    try {
      await jobApi.retrySrsPdf(jobId);
      await queryClient.invalidateQueries({ queryKey: ['job-srs-pdf', jobId] });
    } catch {
      setError('Không thể tạo lại PDF. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={
        compact
          ? 'text-xs text-slate-600'
          : 'mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700'
      }
    >
      {status.isError && <p>Không tải được trạng thái PDF SRS.</p>}
      {(!status.data ||
        status.data.status === 'NONE' ||
        status.data.status === 'PENDING' ||
        status.data.status === 'GENERATING' ||
        (status.data.status === 'FAILED' && status.data.attempts < 5)) && (
        <p>PDF SRS đang được chuẩn bị. Bạn có thể xem dự án ngay; file sẽ sẵn sàng sau.</p>
      )}
      {status.data?.status === 'READY' && (
        <div className="srs-pdf-ready flex flex-wrap items-center gap-3">
          <span className="srs-pdf-ready-label">PDF SRS đã sẵn sàng.</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void openPdf(false)}
            className="cursor-pointer font-semibold text-blue-700 hover:underline disabled:opacity-50"
          >
            Xem PDF
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void openPdf(true)}
            className="cursor-pointer font-semibold text-blue-700 hover:underline disabled:opacity-50"
          >
            Tải PDF
          </button>
        </div>
      )}
      {status.data?.status === 'FAILED' && status.data.attempts >= 5 && (
        <div className="flex flex-wrap items-center gap-3">
          <span>Chưa tạo được PDF SRS. Dự án vẫn đăng thành công.</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void retry()}
            className="cursor-pointer font-semibold text-blue-700 hover:underline disabled:opacity-50"
          >
            Thử lại
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-red-700">
          {error}
        </p>
      )}

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPreviewUrl(null);
          }}
        >
          <dialog
            open
            aria-modal="true"
            aria-label="Xem trước PDF SRS"
            className="relative m-0 flex h-[86vh] w-full max-w-4xl flex-col rounded-2xl border-0 bg-white p-4 text-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Tài liệu đặc tả SRS (PDF)</h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  download={`srs-${jobId}.pdf`}
                  className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  Tải về
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewUrl(null)}
                  aria-label="Đóng"
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center border-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              title="Xem trước PDF SRS"
              src={previewUrl}
              className="mt-3 flex-1 w-full rounded-xl border border-slate-200 bg-slate-100"
            />
          </dialog>
        </div>
      )}
    </div>
  );
}
