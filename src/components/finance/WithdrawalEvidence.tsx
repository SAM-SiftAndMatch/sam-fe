import { useEffect, useState } from 'react';
import {
  type Withdrawal,
  type WithdrawalImage,
  dateTime,
  financeApi,
  financeError,
  money,
} from '../../api/finance';
import { Notice } from './FinanceUI';

function EvidenceImage({ withdrawal, image }: { withdrawal: string; image: WithdrawalImage }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = '';
    setUrl('');
    setError('');
    void financeApi
      .withdrawalImage(withdrawal, image.id, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(new Blob([blob], { type: image.contentType }));
        setUrl(objectUrl);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(financeError(cause));
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [withdrawal, image.id, image.contentType, attempt]);
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-2">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block"
          aria-label={`Xem ảnh ${image.fileName}`}
        >
          <img
            src={url}
            alt={image.fileName}
            className="max-h-72 w-full rounded-lg object-contain"
          />
        </a>
      ) : error ? (
        <Notice error>
          {error}{' '}
          <button
            type="button"
            className="underline"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Tải lại ảnh
          </button>
        </Notice>
      ) : (
        <p className="p-4 text-sm text-slate-500">Đang tải ảnh bằng chứng…</p>
      )}
      <p className="break-all text-xs text-slate-500">{image.fileName}</p>
    </div>
  );
}

export default function WithdrawalEvidence({ withdrawal }: { withdrawal: Withdrawal }) {
  if (withdrawal.requestType !== 'EARLY') return null;
  const project = withdrawal.project;
  return (
    <div className="space-y-4">
      <p className="font-semibold text-amber-800">Ticket xin rút tiền sớm</p>
      {project && (
        <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm">
          <p className="font-semibold">{project.jobTitle}</p>
          <p>Nghiệm thu: {dateTime(project.acceptedAt)}</p>
          <p>Hạn bảo trì: {dateTime(project.availableAt)}</p>
          <p>
            Thù lao: {money(project.earnings)} · Hoàn cọc: {money(project.depositRefund)}
          </p>
          {project.blocked && <Notice error>Dự án có ticket bảo trì đang chặn chi.</Notice>}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold">Lý do xin rút sớm</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
          {withdrawal.requestReason}
        </p>
      </div>
      <p className="text-sm font-semibold">Ảnh bằng chứng ({withdrawal.images?.length || 0})</p>
      {withdrawal.images?.map((image) => (
        <EvidenceImage key={image.id} withdrawal={withdrawal.id} image={image} />
      ))}
      <Notice>
        Ảnh và lý do chỉ dành cho người tạo yêu cầu và admin. Chi sớm không thay đổi thời hạn bảo
        trì.
      </Notice>
    </div>
  );
}
