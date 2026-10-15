import { useNavigate, useOutletContext } from 'react-router-dom';
import ProjectWorkflowPanel from '../components/ProjectWorkflowPanel';
import type { WorkspaceContext } from './WorkspaceLayout';

export default function WorkspaceTimelineView() {
  const context = useOutletContext<WorkspaceContext>();
  const navigate = useNavigate();
  const { summary, role, markCompleted } = context;

  return (
    <section className="flex-1 min-w-0 h-full border border-gray-100 bg-white/50 backdrop-blur-sm rounded-[32px] overflow-y-auto shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      <div className="bg-white px-6 md:px-8 py-5 border-b border-gray-100 rounded-t-[32px] shadow-sm sticky top-0 z-10 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tiến độ dự án</h2>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Theo dõi timeline, báo cáo công việc và sản phẩm bàn giao.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/workspace/${summary.roomId}`)}
          className="lg:hidden shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700 border-0 cursor-pointer"
        >
          Tin nhắn
        </button>
      </div>
      <div className="p-4 md:p-6">
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
