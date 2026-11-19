import type { FeedbackStatus } from '../../api/feedback';
import { feedbackStatusLabels } from '../../lib/feedback';

export default function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  const colors =
    status === 'RESOLVED'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'IN_PROGRESS'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-blue-50 text-blue-700';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors}`}>
      {feedbackStatusLabels[status]}
    </span>
  );
}
