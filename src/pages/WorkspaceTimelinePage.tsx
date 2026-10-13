import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type ChatRoom, chatApi } from '../api/chat';
import AppHeader from '../components/AppHeader';
import ProjectWorkflowPanel from '../components/ProjectWorkflowPanel';
import { useAuthStore } from '../stores/useAuthStore';
import type { JobStatus } from '../types/job';

const jobStatusLabel = (status: JobStatus | undefined): string => {
  switch (status) {
    case 'NEGOTIATING':
      return 'Đang thương lượng';
    case 'AWAITING_PAYMENT':
      return 'Chờ nạp tiền';
    case 'IN_PROGRESS':
      return 'Đang thực hiện';
    case 'COMPLETED':
      return 'Hoàn thành';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return 'Đang trao đổi';
  }
};

const WorkspaceTimelinePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role === 'FREELANCER' ? 'freelancer' : 'client';
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setRoom(null);
    setError(null);
    chatApi
      .getRoomDetail(projectId)
      .catch(() => chatApi.getRoomByJob(projectId))
      .then((result) => {
        if (!cancelled) setRoom(result);
      })
      .catch(() => {
        if (!cancelled) setError('Không tìm thấy workspace cho dự án này.');
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div className="h-screen bg-[#F8FAFC] font-sans flex flex-col overflow-hidden">
      <AppHeader />
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 flex gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
        <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-6 h-full overflow-y-auto pr-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {(room?.jobTitle || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-gray-900 leading-tight line-clamp-1">
                {room?.jobTitle || 'Đang tải...'}
              </h1>
              <span className="text-[10px] font-bold text-[#1D4ED8] tracking-widest uppercase">
                {jobStatusLabel(room?.jobStatus)}
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => room && navigate(`/workspace/${room.id}`)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition-all cursor-pointer border-0 text-left"
            >
              <span className="font-medium text-sm">Tin nhắn</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white shadow-[0_4px_15px_rgba(29,78,216,0.3)] transition-all cursor-pointer border-0 text-left"
            >
              <span className="font-semibold text-sm">Tiến độ dự án</span>
            </button>
          </nav>
        </aside>

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
              onClick={() => room && navigate(`/workspace/${room.id}`)}
              className="lg:hidden shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700 border-0 cursor-pointer"
            >
              Tin nhắn
            </button>
          </div>

          <div className="p-4 md:p-6">
            {error ? (
              <div className="rounded-2xl bg-red-50 p-6 text-sm text-red-700">{error}</div>
            ) : !room ? (
              <div className="rounded-2xl bg-white p-6 text-sm text-gray-500">
                Đang tải dự án...
              </div>
            ) : (
              <ProjectWorkflowPanel
                jobId={room.jobId}
                jobStatus={room.jobStatus}
                role={role}
                layout="expanded"
                onSettlementCompleted={() =>
                  setRoom((current) => (current ? { ...current, jobStatus: 'COMPLETED' } : current))
                }
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default WorkspaceTimelinePage;
