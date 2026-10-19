import type { ProposalStatus } from '../types/proposal';

const STATUS_COLOR: Record<ProposalStatus, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  INVITED: 'border-blue-200 bg-blue-50 text-blue-700',
  ACCEPTED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-red-200 bg-red-50 text-red-700',
};

const STATUS_LABEL: Record<'client' | 'freelancer', Record<ProposalStatus, string>> = {
  client: {
    PENDING: 'Chờ duyệt',
    INVITED: 'Đã mời — chờ freelancer đồng ý',
    ACCEPTED: 'Đã nhận việc',
    REJECTED: 'Đã từ chối',
  },
  freelancer: {
    PENDING: 'Đang chờ',
    INVITED: 'Được mời hợp tác',
    ACCEPTED: 'Đã nhận việc',
    REJECTED: 'Đã từ chối',
  },
};

export default function ProposalStatusBadge({
  status,
  audience,
}: {
  status: ProposalStatus;
  audience: 'client' | 'freelancer';
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLOR[status]}`}
    >
      {STATUS_LABEL[audience][status]}
    </span>
  );
}
