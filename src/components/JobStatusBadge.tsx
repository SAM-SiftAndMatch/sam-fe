import type { JobStatus } from '../types/job';

type JobStatusAppearance = {
  label: string;
  badgeClass: string;
  textClass: string;
};

const JOB_STATUS_APPEARANCE: Record<JobStatus, JobStatusAppearance> = {
  OPEN: {
    label: 'Đang chờ đề xuất',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
    textClass: 'text-blue-700',
  },
  NEGOTIATING: {
    label: 'Đang thương lượng',
    badgeClass: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    textClass: 'text-yellow-700',
  },
  AWAITING_PAYMENT: {
    label: 'Chờ nạp tiền',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    textClass: 'text-amber-700',
  },
  IN_PROGRESS: {
    label: 'Đang thực hiện',
    badgeClass: 'border-orange-200 bg-orange-50 text-orange-700',
    textClass: 'text-orange-700',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    textClass: 'text-emerald-700',
  },
  CANCELLED: {
    label: 'Đã hủy',
    badgeClass: 'border-red-200 bg-red-50 text-red-700',
    textClass: 'text-red-700',
  },
};

const UNKNOWN_STATUS: JobStatusAppearance = {
  label: 'Đang trao đổi',
  badgeClass: 'border-slate-200 bg-slate-50 text-slate-600',
  textClass: 'text-slate-600',
};

export function getJobStatusAppearance(status?: JobStatus | null): JobStatusAppearance {
  return status ? (JOB_STATUS_APPEARANCE[status] ?? UNKNOWN_STATUS) : UNKNOWN_STATUS;
}

export default function JobStatusBadge({
  status,
  className = '',
}: {
  status?: JobStatus | null;
  className?: string;
}) {
  const appearance = getJobStatusAppearance(status);
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${appearance.badgeClass} ${className}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      {appearance.label}
    </span>
  );
}
