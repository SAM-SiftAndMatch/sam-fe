import { useOutletContext } from 'react-router-dom';
import ProjectWorkflowPanel from '../components/ProjectWorkflowPanel';
import type { WorkspaceContext } from './WorkspaceLayout';

export default function WorkspaceTimelineView() {
  const context = useOutletContext<WorkspaceContext>();
  const { summary, role, markCompleted } = context;

  return (
    <section className="workspace-timeline h-full min-w-0 flex-1 overflow-y-auto rounded-[32px] bg-slate-50">
      <div className="workspace-section-header sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-4 py-5 md:px-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tiến độ dự án</h2>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Theo dõi timeline, báo cáo công việc và sản phẩm bàn giao.
          </p>
        </div>
      </div>
      <div className="p-4 md:p-6 xl:p-8">
        <ProjectWorkflowPanel
          jobId={summary.jobId}
          jobStatus={summary.jobStatus}
          role={role}
          layout="expanded"
          onSettlementCompleted={markCompleted}
        />
      </div>
    </section>
  );
}
