import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { jobApi } from '../api/job';

type Props = { jobId: string; compact?: boolean };

export default function SrsPdfActions({ jobId, compact = false }: Props) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const openPdf = async (download: boolean) => {
    const tab = download ? null : window.open('', '_blank');
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
      } else if (tab) {
        tab.location.href = url;
      } else {
        window.location.href = url;
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      tab?.close();
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
    </div>
  );
}
