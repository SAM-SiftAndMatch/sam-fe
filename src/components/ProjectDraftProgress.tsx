import type { ProjectDraftSummary } from '../types/projectDraft';

const PHASE_LABELS: Record<ProjectDraftSummary['flowType'], Record<string, string>> = {
  AI: {
    brief: 'Mô tả dự án',
    'ba-chat': 'Làm rõ yêu cầu',
    'srs-review': 'Duyệt SRS',
    'risk-chat': 'Đánh giá rủi ro',
    completed: 'Hoàn tất AI Brief',
    confirm: 'Xác nhận đăng dự án',
  },
  MANUAL: {
    info: 'Thông tin dự án',
    budget: 'Ngân sách',
    addons: 'Nâng cấp',
    review: 'Kiểm tra',
    confirm: 'Xác nhận đăng dự án',
  },
};

export default function ProjectDraftProgress({ draft }: { draft: ProjectDraftSummary }) {
  const step = Math.max(0, Math.min(5, draft.progressStep ?? 0));
  const percent = Math.max(0, Math.min(100, draft.progressPercent ?? step * 20));
  const phaseLabel = PHASE_LABELS[draft.flowType][draft.phase] ?? 'Đang thực hiện';

  return (
    <div className="project-draft-progress mt-3">
      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
        <span className="project-draft-progress-label text-gray-500">{phaseLabel}</span>
        <span className="project-draft-progress-value font-semibold text-blue-700">{percent}%</span>
      </div>
      <progress
        aria-label={`Tiến độ bản nháp: ${phaseLabel}`}
        value={percent}
        max={100}
        className="sr-only"
      />
      <div aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={`project-draft-progress-segment h-1.5 min-w-0 flex-1 rounded-full ${index < step ? 'bg-blue-600' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
}
