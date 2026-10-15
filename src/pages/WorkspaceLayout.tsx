import { Client } from '@stomp/stompjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { type ChatMessage, chatApi } from '../api/chat';
import type { ContractBroadcast } from '../api/contract';
import { type WorkspaceSummary, workspaceApi } from '../api/workspace';
import AppHeader from '../components/AppHeader';
import { useAuthStore } from '../stores/useAuthStore';
import { type MessagePages, appendConfirmedMessage, workspaceKeys } from './workspace-query';

export interface WorkspaceContext {
  summary: WorkspaceSummary;
  userId: string;
  role: 'client' | 'freelancer';
  markCompleted: () => void;
  sendMessage: (content: string) => boolean;
  getDraft: () => string;
  saveDraft: (content: string) => void;
  getScrollTop: () => number | undefined;
  saveScrollTop: (position: number) => void;
}

const statusLabel = (status: WorkspaceSummary['jobStatus'] | undefined) => {
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

export default function WorkspaceLayout() {
  const { projectId } = useParams<{ projectId: string }>();
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
              <span className="text-[10px] font-bold text-[#1D4ED8] tracking-widest uppercase">
                {statusLabel(summary?.jobStatus)}
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
