import { useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { workflowApi } from '../api/workflow';
import { workspaceKeys } from '../pages/workspace-query';
import { useAuthStore } from '../stores/useAuthStore';
import type {
  ProjectDelivery,
  ProjectTaskStatus,
  ProjectTimeline,
  ProjectWorkflowPanelProps,
  QaPlan,
  SandboxSettlement,
  TaskReport,
} from '../types/workflow';

const statusLabel: Record<ProjectTaskStatus, string> = {
  TODO: 'Chưa bắt đầu',
  IN_PROGRESS: 'Đang thực hiện',
  BLOCKED: 'Đang bị chặn',
  SUBMITTED: 'Đã báo cáo hoàn thành',
  ACCEPTED: 'Đã nghiệm thu',
  REOPENED: 'Cần làm lại',
};

const statusClass: Record<ProjectTaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  BLOCKED: 'bg-red-50 text-red-700',
  SUBMITTED: 'bg-violet-50 text-violet-700',
  ACCEPTED: 'bg-emerald-50 text-emerald-700',
  REOPENED: 'bg-amber-50 text-amber-700',
};

const ProjectWorkflowPanel: React.FC<ProjectWorkflowPanelProps> = ({
  jobId,
  jobStatus,
  role,
  onSettlementCompleted,
  layout = 'compact',
}) => {
  const userId = useAuthStore((state) => state.user?.userId) ?? '';
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const reportTask = searchParams.get('task');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [reportLists, setReportLists] = useState<Record<string, TaskReport[]>>({});
  const [qaPlans, setQaPlans] = useState<Record<string, QaPlan>>({});
  const [expandedQaId, setExpandedQaId] = useState<string | null>(null);
  const [loadingQaId, setLoadingQaId] = useState<string | null>(null);
  const [settlement, setSettlement] = useState<SandboxSettlement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportTaskId, setReportTaskId] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [reportProgress, setReportProgress] = useState(0);
  const [reportStatus, setReportStatus] = useState<ProjectTaskStatus>('IN_PROGRESS');
  const [submitting, setSubmitting] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [webUrl, setWebUrl] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [activeDelivery, setActiveDelivery] = useState<ProjectDelivery | null>(null);
  const [modalMode, setModalMode] = useState<'accept' | 'revision' | null>(null);
  const [revisionReason, setRevisionReason] = useState('');

  const canUseWorkflow = jobStatus === 'IN_PROGRESS' || jobStatus === 'COMPLETED';
  const canReport = role === 'freelancer' && jobStatus === 'IN_PROGRESS';
  const timelineQuery = useQuery({
    queryKey: workspaceKeys.timeline(userId, jobId),
    queryFn: () => workflowApi.getTimelineSummary(jobId),
    enabled: canUseWorkflow && Boolean(userId),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
  const deliveriesQuery = useQuery({
    queryKey: workspaceKeys.deliveries(userId, jobId),
    queryFn: () => workflowApi.getDeliveries(jobId),
    enabled: canUseWorkflow && Boolean(userId),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
  const timeline = timelineQuery.data ?? null;
  const deliveries = deliveriesQuery.data ?? [];
  const loading = canUseWorkflow && (timelineQuery.isPending || deliveriesQuery.isPending);
  const queryError = timelineQuery.error ?? deliveriesQuery.error;
  const loadWorkflow = () => {
    setError(null);
    void Promise.all([timelineQuery.refetch(), deliveriesQuery.refetch()]);
  };

  const loadTaskReports = useCallback(
    async (taskId: string) => {
      try {
        const result = await queryClient.fetchQuery({
          queryKey: workspaceKeys.reports(userId, jobId, taskId),
          queryFn: () => workflowApi.getTaskReports(jobId, taskId),
          staleTime: 10_000,
        });
        setReportLists((current) => ({ ...current, [taskId]: result }));
        setExpandedTaskId(taskId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tải được báo cáo');
      }
    },
    [jobId, queryClient, userId]
  );

  const setReportLocation = useCallback(
    (taskId: string | null, replace = false) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (taskId) {
            next.set('task', taskId);
          } else {
            next.delete('task');
          }
          next.delete('reportPage');
          return next;
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (!searchParams.has('page') && !searchParams.has('reportPage')) return;
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('page');
        next.delete('reportPage');
        return next;
      },
      { replace: true }
    );
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!canUseWorkflow || !reportTask || !timeline?.tasks.some((task) => task.id === reportTask)) {
      setExpandedTaskId(null);
      return;
    }
    // Khi timeline được đồng bộ lại, làm mới báo cáo đang mở của phía còn lại.
    void loadTaskReports(reportTask);
  }, [canUseWorkflow, loadTaskReports, reportTask, timeline?.tasks, timelineQuery.dataUpdatedAt]);

  const toggleQaPlan = async (deliveryId: string) => {
    if (expandedQaId === deliveryId) {
      setExpandedQaId(null);
      return;
    }
    setExpandedQaId(deliveryId);
    if (qaPlans[deliveryId]) return;
    setLoadingQaId(deliveryId);
    try {
      const plan = await workflowApi.getQaPlan(jobId, deliveryId);
      setQaPlans((current) => ({ ...current, [deliveryId]: plan }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được checklist nghiệm thu');
    } finally {
      setLoadingQaId(null);
    }
  };

  const weeks = useMemo(() => {
    const grouped = new Map<number, ProjectTimeline['tasks']>();
    for (const task of timeline?.tasks ?? []) {
      grouped.set(task.weekNumber, [...(grouped.get(task.weekNumber) ?? []), task]);
    }
    return [...grouped.entries()].sort(([a], [b]) => a - b);
  }, [timeline]);

  const openReport = (taskId: string, progress: number, status: ProjectTaskStatus) => {
    setReportTaskId(taskId);
    setReportProgress(progress);
    setReportStatus(status === 'TODO' || status === 'REOPENED' ? 'IN_PROGRESS' : status);
    setReportContent('');
    setEvidenceUrl('');
  };

  const submitReport = async () => {
    if (!reportTaskId || !reportContent.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await workflowApi.addTaskReport(jobId, reportTaskId, {
        content: reportContent.trim(),
        evidenceUrl: evidenceUrl.trim() || undefined,
        progress: reportProgress,
        status: reportStatus,
      });
      queryClient.setQueryData<ProjectTimeline>(workspaceKeys.timeline(userId, jobId), {
        ...updated,
        tasks: updated.tasks.map((task) => ({ ...task, reports: [] })),
      });
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.timeline(userId, jobId) });
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.reports(userId, jobId, reportTaskId),
      });
      setReportLists((current) => {
        const next = { ...current };
        delete next[reportTaskId];
        return next;
      });
      setReportLocation(reportTaskId, true);
      setReportTaskId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được báo cáo');
    } finally {
      setSubmitting(false);
    }
  };

  const submitDelivery = async () => {
    if (!webUrl.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const delivery = await workflowApi.submitDelivery(jobId, {
        webUrl: webUrl.trim(),
        repositoryUrl: repositoryUrl.trim() || undefined,
        note: deliveryNote.trim() || undefined,
      });
      queryClient.setQueryData<ProjectDelivery[]>(
        workspaceKeys.deliveries(userId, jobId),
        (current) => [delivery, ...(current ?? [])]
      );
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.deliveries(userId, jobId) });
      setWebUrl('');
      setRepositoryUrl('');
      setDeliveryNote('');
      setShowDeliveryForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được sản phẩm bàn giao');
    } finally {
      setSubmitting(false);
    }
  };

  const acceptDelivery = async (delivery: ProjectDelivery) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await workflowApi.acceptDelivery(jobId, delivery.id);
      queryClient.setQueryData<ProjectDelivery[]>(
        workspaceKeys.deliveries(userId, jobId),
        (current) =>
          (current ?? []).map((item) => (item.id === result.delivery.id ? result.delivery : item))
      );
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.deliveries(userId, jobId) });
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.timeline(userId, jobId) });
      setSettlement(result.settlement);
      setModalMode(null);
      setActiveDelivery(null);
      onSettlementCompleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xác nhận nghiệm thu');
    } finally {
      setSubmitting(false);
    }
  };

  const openRevisionModal = (delivery: ProjectDelivery) => {
    setActiveDelivery(delivery);
    setRevisionReason('');
    setModalMode('revision');
  };

  const requestRevision = async () => {
    if (!activeDelivery || !revisionReason.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await workflowApi.requestDeliveryRevision(jobId, activeDelivery.id, {
        reason: revisionReason.trim(),
      });
      queryClient.setQueryData<ProjectDelivery[]>(
        workspaceKeys.deliveries(userId, jobId),
        (current) => (current ?? []).map((item) => (item.id === updated.id ? updated : item))
      );
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.deliveries(userId, jobId) });
      setModalMode(null);
      setActiveDelivery(null);
      setRevisionReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi yêu cầu chỉnh sửa');
    } finally {
      setSubmitting(false);
    }
  };

  if (!canUseWorkflow) {
    return (
      <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <h3 className="text-[17px] font-bold text-gray-900">Tiến độ dự án</h3>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Timeline từ SRS sẽ bắt đầu khi hai bên hoàn tất nạp tiền và dự án chuyển sang thực hiện.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col gap-5 ${
        layout === 'expanded' ? 'p-6 md:p-8' : 'p-5'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[17px] font-bold text-gray-900">Tiến độ và bàn giao</h3>
          <button
            type="button"
            onClick={() => void loadWorkflow()}
            className="text-[11px] font-bold text-blue-700 bg-transparent border-0 cursor-pointer"
          >
            Tải lại
          </button>
        </div>
        {timeline && (
          <>
            <div className="flex justify-between text-[11px] text-gray-500 mt-3 mb-1.5">
              <span>
                Tuần {timeline.currentWeek}/{timeline.totalWeeks}
              </span>
              <span>{timeline.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${timeline.progress}%` }}
              />
            </div>
          </>
        )}
      </div>

      {loading && <p className="text-xs text-gray-500">Đang tải timeline...</p>}
      {(error || queryError) && (
        <p className="text-xs text-red-600 bg-red-50 rounded-xl p-3">
          {error ||
            (queryError instanceof Error ? queryError.message : 'Không tải được tiến độ dự án')}
        </p>
      )}

      <div className={`flex flex-col gap-4 ${layout === 'expanded' ? 'md:gap-5' : ''}`}>
        {weeks.map(([weekNumber, tasks]) => (
          <section key={weekNumber} className="relative pl-5 border-l-2 border-slate-200">
            <span className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-blue-600 border-2 border-white" />
            <p className="text-xs font-black text-gray-900 mb-2">Tuần {weekNumber}</p>
            <div className="flex flex-col gap-2">
              {tasks.map((task) => {
                const latestReport = reportLists[task.id]?.[0];
                return (
                  <article
                    key={task.id}
                    className="rounded-xl border border-gray-100 p-3 bg-slate-50"
                  >
                    <p className="text-xs font-bold text-gray-800 leading-relaxed">{task.title}</p>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusClass[task.status]}`}
                      >
                        {statusLabel[task.status]}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">{task.progress}%</span>
                    </div>
                    {latestReport && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-[11px] text-gray-600 line-clamp-3">
                          {latestReport.content}
                        </p>
                        {latestReport.evidenceUrl && (
                          <a
                            href={latestReport.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-blue-700 hover:underline"
                          >
                            Xem bằng chứng
                          </a>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (expandedTaskId === task.id) setReportLocation(null);
                        else setReportLocation(task.id);
                      }}
                      className="mt-2 text-[11px] font-bold text-blue-700 bg-transparent border-0 p-0 cursor-pointer"
                    >
                      {expandedTaskId === task.id ? 'Ẩn báo cáo' : 'Xem báo cáo'}
                    </button>
                    {expandedTaskId === task.id &&
                      reportTask === task.id &&
                      reportLists[task.id] && (
                        <div className="mt-2 text-[11px] text-gray-500">
                          {reportLists[task.id].map((report) => (
                            <p
                              key={report.id}
                              className="border-t border-gray-200 py-2 whitespace-pre-wrap"
                            >
                              {report.content}
                            </p>
                          ))}
                          {reportLists[task.id].length === 0 && <p>Chưa có báo cáo.</p>}
                        </div>
                      )}
                    {canReport && (
                      <button
                        type="button"
                        onClick={() => openReport(task.id, task.progress, task.status)}
                        className="mt-2 text-[11px] font-bold text-blue-700 bg-transparent border-0 p-0 cursor-pointer"
                      >
                        Cập nhật tiến độ
                      </button>
                    )}
                    {reportTaskId === task.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col gap-2">
                        <textarea
                          value={reportContent}
                          onChange={(event) => setReportContent(event.target.value)}
                          placeholder="Mô tả công việc đã làm, vướng mắc hoặc kết quả..."
                          className="w-full min-h-20 rounded-lg border border-gray-200 p-2 text-xs resize-y outline-none focus:border-blue-500"
                        />
                        <input
                          type="url"
                          value={evidenceUrl}
                          onChange={(event) => setEvidenceUrl(event.target.value)}
                          placeholder="Link bằng chứng hoặc bản demo"
                          className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
                        />
                        <select
                          value={reportStatus}
                          onChange={(event) =>
                            setReportStatus(event.target.value as ProjectTaskStatus)
                          }
                          className="w-full rounded-lg border border-gray-200 p-2 text-xs bg-white"
                        >
                          <option value="IN_PROGRESS">Đang thực hiện</option>
                          <option value="BLOCKED">Đang bị chặn</option>
                          <option value="SUBMITTED">Đã hoàn thành, chờ duyệt</option>
                        </select>
                        <label className="text-[11px] text-gray-600">
                          Tiến độ: {reportProgress}%
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={reportProgress}
                            onChange={(event) => setReportProgress(Number(event.target.value))}
                            className="w-full mt-1"
                          />
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setReportTaskId(null)}
                            className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-bold border-0 cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => void submitReport()}
                            disabled={submitting || !reportContent.trim()}
                            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-[11px] font-bold border-0 cursor-pointer disabled:opacity-50"
                          >
                            Gửi báo cáo
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-gray-900">Sản phẩm bàn giao</h4>
          {canReport && timeline?.readyForDelivery && (
            <button
              type="button"
              onClick={() => setShowDeliveryForm((current) => !current)}
              className="text-[11px] font-bold text-blue-700 bg-transparent border-0 cursor-pointer"
            >
              Nộp phiên bản mới
            </button>
          )}
        </div>
        {canReport && timeline && !timeline.readyForDelivery && (
          <p className="text-[11px] text-gray-500 mt-2">
            Hoàn thành toàn bộ timeline trước khi nộp sản phẩm.
          </p>
        )}
        {showDeliveryForm && (
          <div className="mt-3 flex flex-col gap-2">
            <input
              type="url"
              value={webUrl}
              onChange={(event) => setWebUrl(event.target.value)}
              placeholder="Link website bàn giao"
              className="rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
            />
            <input
              type="url"
              value={repositoryUrl}
              onChange={(event) => setRepositoryUrl(event.target.value)}
              placeholder="Link repository (không bắt buộc)"
              className="rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
            />
            <textarea
              value={deliveryNote}
              onChange={(event) => setDeliveryNote(event.target.value)}
              placeholder="Ghi chú chạy thử (không nhập mật khẩu)"
              className="min-h-16 rounded-lg border border-gray-200 p-2 text-xs resize-y outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => void submitDelivery()}
              disabled={submitting || !webUrl.trim()}
              className="py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold border-0 cursor-pointer disabled:opacity-50"
            >
              Gửi sản phẩm bàn giao
            </button>
          </div>
        )}
        <div className="mt-3 flex flex-col gap-2">
          {settlement && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-800">
              Nghiệm thu đã hoàn tất. Ví thử nghiệm freelancer được ghi có{' '}
              {(settlement.freelancerPayout + settlement.depositRefund).toLocaleString('vi-VN')}{' '}
              VND. Phí nền tảng: {settlement.platformFee.toLocaleString('vi-VN')} VND.
            </div>
          )}
          {deliveries.length === 0 ? (
            <p className="text-[11px] text-gray-500">Chưa có phiên bản bàn giao.</p>
          ) : (
            deliveries.map((delivery) => (
              <div key={delivery.id} className="rounded-xl border border-gray-100 p-3 bg-slate-50">
                <div className="flex justify-between gap-2">
                  <p className="text-xs font-bold text-gray-800">
                    Phiên bản {delivery.versionNumber}
                  </p>
                  <span className="text-[10px] font-bold text-violet-700">
                    {delivery.status === 'ACCEPTED'
                      ? 'Đã nghiệm thu'
                      : delivery.status === 'REVISION_REQUESTED'
                        ? 'Cần chỉnh sửa'
                        : 'Chờ nghiệm thu'}
                  </span>
                </div>
                <a
                  href={delivery.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[11px] text-blue-700 font-bold mt-1 truncate hover:underline"
                >
                  Mở website bàn giao
                </a>
                {delivery.note && <p className="text-[11px] text-gray-500 mt-1">{delivery.note}</p>}
                {delivery.revisionReason && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
                    <span className="font-bold">Yêu cầu chỉnh sửa: </span>
                    {delivery.revisionReason}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => void toggleQaPlan(delivery.id)}
                  disabled={loadingQaId === delivery.id}
                  className="mt-3 text-[11px] font-bold text-blue-700 bg-transparent border-0 p-0 cursor-pointer disabled:opacity-50"
                >
                  {loadingQaId === delivery.id
                    ? 'Đang tải checklist...'
                    : expandedQaId === delivery.id
                      ? 'Ẩn checklist nghiệm thu'
                      : 'Xem checklist nghiệm thu'}
                </button>
                {expandedQaId === delivery.id && qaPlans[delivery.id] && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-[11px] font-bold text-gray-800">Checklist nghiệm thu</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {qaPlans[delivery.id].status === 'GENERATED'
                        ? 'Được tạo từ SRS và timeline bởi AI'
                        : 'Được tạo từ timeline SRS'}
                    </p>
                    <ol className="mt-2 flex flex-col gap-2 list-decimal list-inside">
                      {qaPlans[delivery.id].checklistItems.map((item) => (
                        <li key={item.id} className="text-[11px] text-gray-700">
                          <span className="font-bold">{item.title}</span>
                          <p className="mt-0.5 whitespace-pre-line text-gray-500">
                            {item.testSteps}
                          </p>
                          <p className="mt-0.5 text-gray-600">Cần đạt: {item.expectedResult}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {role === 'client' && delivery.status === 'SUBMITTED' && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openRevisionModal(delivery)}
                      disabled={submitting}
                      className="py-2.5 rounded-lg border border-amber-300 bg-white text-amber-800 text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      Yêu cầu chỉnh sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDelivery(delivery);
                        setModalMode('accept');
                      }}
                      disabled={submitting || !qaPlans[delivery.id]}
                      className="py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold border-0 cursor-pointer disabled:opacity-50"
                    >
                      Xác nhận nghiệm thu
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
      {modalMode && activeDelivery && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setModalMode(null);
              setActiveDelivery(null);
            }
          }}
        >
          <dialog
            open
            aria-labelledby="delivery-modal-title"
            className="relative m-0 w-full max-w-md border-0 rounded-2xl bg-white p-5 shadow-2xl"
          >
            {modalMode === 'accept' ? (
              <>
                <h4 id="delivery-modal-title" className="text-base font-bold text-gray-900">
                  Xác nhận nghiệm thu
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Bạn xác nhận đã kiểm tra website, báo cáo của freelancer và checklist nghiệm thu
                  cho phiên bản {activeDelivery.versionNumber}.
                </p>
                <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                  Sau khi xác nhận, hệ thống sẽ quyết toán bằng ví thử nghiệm và không thể yêu cầu
                  chỉnh sửa phiên bản này.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode(null);
                      setActiveDelivery(null);
                    }}
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-slate-100 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-50"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={() => void acceptDelivery(activeDelivery)}
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {submitting ? 'Đang xác nhận...' : 'Xác nhận nghiệm thu'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h4 id="delivery-modal-title" className="text-base font-bold text-gray-900">
                  Yêu cầu chỉnh sửa
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Hãy nêu rõ lỗi hoặc hạng mục cần Freelancer điều chỉnh cho phiên bản{' '}
                  {activeDelivery.versionNumber}.
                </p>
                <textarea
                  value={revisionReason}
                  onChange={(event) => setRevisionReason(event.target.value)}
                  maxLength={5000}
                  placeholder="Ví dụ: Chức năng đăng nhập chưa hiển thị thông báo lỗi khi nhập sai mật khẩu."
                  className="mt-3 min-h-28 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                />
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode(null);
                      setActiveDelivery(null);
                    }}
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-slate-100 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => void requestRevision()}
                    disabled={submitting || !revisionReason.trim()}
                    className="flex-1 rounded-lg bg-amber-600 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </button>
                </div>
              </>
            )}
          </dialog>
        </div>
      )}
    </div>
  );
};

export default ProjectWorkflowPanel;
