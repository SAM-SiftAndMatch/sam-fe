import type { Client } from '@stomp/stompjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ArrowLeft, ListChecks, MessageSquare } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { type ChatMessage, type SendChatMessage, chatApi } from '../api/chat';
import type { ContractBroadcast } from '../api/contract';
import { type WorkspaceSummary, workspaceApi } from '../api/workspace';
import AppHeader from '../components/AppHeader';
import { getJobStatusAppearance } from '../components/JobStatusBadge';
import MaintenancePanel from '../components/finance/MaintenancePanel';
import { createAuthenticatedStompClient } from '../lib/authenticated-stomp';
import { useAuthStore } from '../stores/useAuthStore';
import { type MessagePages, appendConfirmedMessage, workspaceKeys } from './workspace-query';

export interface WorkspaceContext {
  summary: WorkspaceSummary;
  userId: string;
  role: 'client' | 'freelancer';
  workspacesPage: number;
  markCompleted: () => void;
  sendMessage: (input: SendChatMessage) => Promise<void>;
  getDraft: () => string;
  saveDraft: (content: string) => void;
  getScrollTop: () => number | undefined;
  saveScrollTop: (position: number) => void;
}

export default function WorkspaceLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const [workspacesPage] = useState(() => {
    const page = (location.state as { workspacesPage?: unknown } | null)?.workspacesPage;
    return typeof page === 'number' && Number.isSafeInteger(page) && page > 0 ? page : 1;
  });
  const userId = useAuthStore((state) => state.user?.userId) ?? '';
  const role = useAuthStore((state) => state.user?.role) === 'FREELANCER' ? 'freelancer' : 'client';
  const queryClient = useQueryClient();
  const stompRef = useRef<Client | null>(null);
  const draftsRef = useRef<Record<string, string>>({});
  const scrollRef = useRef<Record<string, number>>({});
  const summaryQuery = useQuery({
    queryKey: workspaceKeys.summary(userId, projectId ?? ''),
    enabled: Boolean(projectId && userId),
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      try {
        return await workspaceApi.getSummary(projectId!);
      } catch (error) {
        if (!isAxiosError(error) || error.response?.status !== 404) throw error;
        const room = await chatApi.getRoomByJob(projectId!);
        return workspaceApi.getSummary(room.id);
      }
    },
  });
  const summary = summaryQuery.data;
  const roomId = summary?.roomId;
  const jobId = summary?.jobId;
  const contractId = summary?.contractId;

  useEffect(() => {
    if (!roomId || !jobId || !userId) return;
    const client = createAuthenticatedStompClient({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`) as WebSocket,
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      client.subscribe(`/topic/chat/${roomId}`, (frame) => {
        try {
          const message = JSON.parse(frame.body) as ChatMessage;
          void queryClient.invalidateQueries({ queryKey: workspaceKeys.resources(userId, roomId) });
          const key = workspaceKeys.messages(userId, roomId);
          void queryClient.cancelQueries({ queryKey: key }).then(() => {
            if (queryClient.getQueryData<MessagePages>(key)) {
              queryClient.setQueryData<MessagePages>(key, (previous) =>
                appendConfirmedMessage(previous, message)
              );
            } else {
              void queryClient.invalidateQueries({ queryKey: key });
            }
          });
          if (message.system) {
            void queryClient.invalidateQueries({
              queryKey: workspaceKeys.summary(userId, projectId ?? ''),
            });
          }
        } catch {
          /* Ignore malformed frames. */
        }
      });
      if (contractId) {
        client.subscribe(`/topic/contracts/${contractId}`, (frame) => {
          try {
            const update = JSON.parse(frame.body) as ContractBroadcast;
            queryClient.setQueryData<WorkspaceSummary>(
              workspaceKeys.summary(userId, projectId ?? ''),
              (previous) =>
                previous
                  ? {
                      ...previous,
                      agreedAmount: update.agreedAmount ?? previous.agreedAmount,
                      contractStatus: update.contractStatus ?? previous.contractStatus,
                      reviewStatus: update.reviewStatus ?? previous.reviewStatus,
                      jobStatus:
                        update.contractStatus === 'ACTIVE' && previous.jobStatus === 'NEGOTIATING'
                          ? 'AWAITING_PAYMENT'
                          : previous.jobStatus,
                    }
                  : previous
            );
            void queryClient.invalidateQueries({
              queryKey: workspaceKeys.summary(userId, projectId ?? ''),
            });
          } catch {
            /* Ignore malformed frames. */
          }
        });
      }
      // Đối chiếu sau mọi lần kết nối để không hụt tin giữa GET và subscribe.
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.messages(userId, roomId) });
    };
    client.activate();
    stompRef.current = client;
    return () => {
      if (stompRef.current === client) stompRef.current = null;
      void client.deactivate();
    };
  }, [roomId, jobId, contractId, userId, projectId, queryClient]);

  const sendMessage = useCallback(
    async (input: SendChatMessage) => {
      if (!roomId || !userId) throw new Error('Không tìm thấy cuộc hội thoại.');
      const message = await chatApi.sendMessage(roomId, input);
      if (useAuthStore.getState().user?.userId !== userId) return;
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.resources(userId, roomId) });
      const key = workspaceKeys.messages(userId, roomId);
      await queryClient.cancelQueries({ queryKey: key });
      if (queryClient.getQueryData<MessagePages>(key)) {
        queryClient.setQueryData<MessagePages>(key, (previous) =>
          appendConfirmedMessage(previous, message)
        );
      } else {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
    [roomId, userId, queryClient]
  );
  const getDraft = useCallback(() => draftsRef.current[roomId ?? ''] ?? '', [roomId]);
  const saveDraft = useCallback(
    (content: string) => {
      if (roomId) draftsRef.current[roomId] = content;
    },
    [roomId]
  );
  const getScrollTop = useCallback(() => scrollRef.current[roomId ?? ''], [roomId]);
  const saveScrollTop = useCallback(
    (position: number) => {
      if (roomId) scrollRef.current[roomId] = position;
    },
    [roomId]
  );

  const context = useMemo<WorkspaceContext | null>(
    () =>
      summary
        ? {
            summary,
            userId,
            role,
            workspacesPage,
            sendMessage,
            getDraft,
            saveDraft,
            getScrollTop,
            saveScrollTop,
            markCompleted: () => {
              queryClient.setQueryData<WorkspaceSummary>(
                workspaceKeys.summary(userId, projectId ?? ''),
                (previous) => (previous ? { ...previous, jobStatus: 'COMPLETED' } : previous)
              );
              void queryClient.invalidateQueries({
                queryKey: workspaceKeys.summary(userId, projectId ?? ''),
              });
            },
          }
        : null,
    [
      summary,
      userId,
      role,
      workspacesPage,
      projectId,
      queryClient,
      sendMessage,
      getDraft,
      saveDraft,
      getScrollTop,
      saveScrollTop,
    ]
  );

  return (
    <div className="workspace-route flex h-dvh flex-col overflow-hidden bg-[#F8FAFC] font-sans">
      <div className="shrink-0">
        <AppHeader />
      </div>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="workspace-sidebar flex shrink-0 flex-col border-b border-slate-200 bg-slate-100 lg:h-full lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 px-4 py-3 lg:px-5 lg:py-5">
            <Link
              to={`/workspaces?page=${workspacesPage}`}
              className="workspace-back-link inline-flex items-center gap-2 text-xs font-medium text-slate-600 transition-colors hover:text-blue-700"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Tất cả tin nhắn</span>
            </Link>
            <div className="mt-4 flex min-w-0 items-start gap-3 lg:mt-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D4ED8] text-lg font-bold text-white">
                {(summary?.jobTitle || 'P').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">
                  {summary?.jobTitle || 'Đang tải dự án...'}
                </h1>
                <span
                  className={`mt-1 block text-[10px] font-semibold uppercase tracking-wide ${getJobStatusAppearance(summary?.jobStatus).textClass}`}
                >
                  {getJobStatusAppearance(summary?.jobStatus).label}
                </span>
              </div>
            </div>
          </div>
          <nav
            aria-label="Điều hướng không gian làm việc"
            className="grid grid-cols-2 lg:grid-cols-1 lg:gap-1 lg:px-3 lg:py-5"
          >
            <NavLink
              end
              to={`/workspace/${roomId ?? projectId}`}
              className={({ isActive }) =>
                `workspace-nav-link flex items-center lg:rounded-xl justify-center gap-2 border-b-2 border-l-0 px-4 py-3 text-sm transition-colors lg:justify-start lg:gap-3 lg:border-b-0 lg:border-l-2 ${isActive ? 'workspace-nav-link--active border-blue-600 bg-blue-50 font-semibold text-blue-700' : 'border-transparent font-medium text-slate-600 hover:bg-white/70'}`
              }
            >
              <MessageSquare size={18} aria-hidden="true" />
              Tin nhắn
            </NavLink>
            <NavLink
              to={`/workspace/${roomId ?? projectId}/timeline`}
              className={({ isActive }) =>
                `workspace-nav-link flex items-center lg:rounded-xl justify-center gap-2 border-b-2 border-l-0 px-4 py-3 text-sm transition-colors lg:justify-start lg:gap-3 lg:border-b-0 lg:border-l-2 ${isActive ? 'workspace-nav-link--active border-blue-600 bg-blue-50 font-semibold text-blue-700' : 'border-transparent font-medium text-slate-600 hover:bg-white/70'}`
              }
            >
              <ListChecks size={18} aria-hidden="true" />
              Tiến độ dự án
            </NavLink>
          </nav>
          {summary && (
            <div className="mt-auto hidden space-y-4 border-t border-slate-200 p-5 lg:block">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Khách hàng
                </p>
                <p className="mt-1 break-words text-xs font-medium text-slate-700">
                  {summary.clientName}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Freelancer
                </p>
                <p className="mt-1 break-words text-xs font-medium text-slate-700">
                  {summary.freelancerName}
                </p>
              </div>
            </div>
          )}
        </aside>
        {summaryQuery.isError ? (
          <section className="flex-1 bg-white p-8 text-sm text-red-700">
            Không tải được workspace.{' '}
            <button type="button" onClick={() => void summaryQuery.refetch()} className="underline">
              Thử lại
            </button>
          </section>
        ) : context ? (
          <Suspense
            fallback={
              <section className="flex-1 bg-white p-8 text-sm text-gray-500">
                Đang mở trang...
              </section>
            }
          >
            <section className="workspace-content flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <div className="workspace-maintenance shrink-0">
                <MaintenancePanel
                  jobId={context.summary.jobId}
                  completed={context.summary.jobStatus === 'COMPLETED'}
                  viewerRole={context.role}
                />
              </div>
              <div className="flex min-h-0 flex-1">
                <Outlet context={context} />
              </div>
            </section>
          </Suspense>
        ) : (
          <section className="flex-1 bg-white p-8 text-sm text-gray-500">
            Đang tải workspace...
          </section>
        )}
      </main>
    </div>
  );
}
