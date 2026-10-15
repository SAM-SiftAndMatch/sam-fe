import { Client } from '@stomp/stompjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { type ChatMessage, chatApi } from '../api/chat';
import type { ContractBroadcast } from '../api/contract';
import { type WorkspaceSummary, workspaceApi } from '../api/workspace';
import AppHeader from '../components/AppHeader';
import { getJobStatusAppearance } from '../components/JobStatusBadge';
import { useAuthStore } from '../stores/useAuthStore';
import { type MessagePages, appendConfirmedMessage, workspaceKeys } from './workspace-query';

export interface WorkspaceContext {
  summary: WorkspaceSummary;
  userId: string;
  role: 'client' | 'freelancer';
  workspacesPage: number;
  markCompleted: () => void;
  sendMessage: (content: string) => boolean;
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
    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`) as WebSocket,
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      client.subscribe(`/topic/chat/${roomId}`, (frame) => {
        try {
          const message = JSON.parse(frame.body) as ChatMessage;
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
    (content: string) => {
      const client = stompRef.current;
      if (!client?.connected || !roomId || !userId) return false;
      client.publish({
        destination: `/app/chat/${roomId}/send`,
        body: JSON.stringify({ senderId: userId, content }),
      });
      return true;
    },
    [roomId, userId]
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
    <div className="h-screen bg-[#F8FAFC] font-sans flex flex-col overflow-hidden">
      <AppHeader />
      <div className="w-full max-w-[1600px] mx-auto px-4 pt-3 md:px-6">
        <Link
          to={`/workspaces?page=${workspacesPage}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-black hover:underline"
        >
          <svg
            aria-hidden="true"
            className="h-6 w-6 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
          </svg>
          <span>Tất cả tin nhắn</span>
        </Link>
      </div>
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 flex gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
        <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-6 h-full overflow-y-auto pr-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {(summary?.jobTitle || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-gray-900 leading-tight line-clamp-1">
                {summary?.jobTitle || 'Đang tải...'}
              </h1>
              <span
                className={`text-[10px] font-semibold tracking-wider uppercase ${getJobStatusAppearance(summary?.jobStatus).textClass}`}
              >
                {getJobStatusAppearance(summary?.jobStatus).label}
              </span>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <NavLink
              end
              to={`/workspace/${roomId ?? projectId}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${isActive ? 'bg-[#1D4ED8] text-white font-semibold' : 'text-gray-600 hover:bg-white'}`
              }
            >
              Tin nhắn
            </NavLink>
            <NavLink
              to={`/workspace/${roomId ?? projectId}/timeline`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${isActive ? 'bg-[#1D4ED8] text-white font-semibold' : 'text-gray-600 hover:bg-white'}`
              }
            >
              Tiến độ dự án
            </NavLink>
          </nav>
        </aside>
        {summaryQuery.isError ? (
          <section className="flex-1 rounded-[32px] bg-white p-8 text-sm text-red-700">
            Không tải được workspace.{' '}
            <button type="button" onClick={() => void summaryQuery.refetch()} className="underline">
              Thử lại
            </button>
          </section>
        ) : context ? (
          <Suspense
            fallback={
              <section className="flex-1 rounded-[32px] bg-white p-8 text-sm text-gray-500">
                Đang mở trang...
              </section>
            }
          >
            <Outlet context={context} />
          </Suspense>
        ) : (
          <section className="flex-1 rounded-[32px] bg-white p-8 text-sm text-gray-500">
            Đang tải workspace...
          </section>
        )}
      </main>
    </div>
  );
}
