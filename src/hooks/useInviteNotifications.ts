import { Client } from '@stomp/stompjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { type UserNotification, notificationsApi } from '../api/notifications';
import { useAuthStore } from '../stores/useAuthStore';

export type InviteNotification = UserNotification;

/**
 * Subscribe kênh /topic/users/{userId}/notifications để nhận realtime:
 * - 1_TOUCH_INVITE (client -> dev), DEV_CLAIM (dev -> client), CHAT_OPENED
 * - PROPOSAL_RECEIVED (dev nộp -> client), PROPOSAL_INVITE (client mời -> dev),
 *   PROPOSAL_ACCEPTED (dev đồng ý -> client), PROPOSAL_REJECTED
 * DB là nguồn dữ liệu chuẩn; websocket chỉ giúp đồng bộ realtime.
 */
export function useInviteNotifications(onEvent?: (n: InviteNotification) => void) {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const userId = user?.userId;
  const [latest, setLatest] = useState<InviteNotification | null>(null);
  const feed = useQuery({
    queryKey: ['user-notifications', 'recent', userId],
    queryFn: notificationsApi.recent,
    enabled: Boolean(isAuthenticated && userId),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
  const notifications = feed.data?.items ?? [];
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`) as WebSocket,
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      client.subscribe(`/topic/users/${userId}/notifications`, (msg) => {
        try {
          const payload = JSON.parse(msg.body) as InviteNotification;
          if (
            payload.type !== '1_TOUCH_INVITE' &&
            payload.type !== 'DEV_CLAIM' &&
            payload.type !== 'CHAT_OPENED' &&
            payload.type !== 'PROPOSAL_RECEIVED' &&
            payload.type !== 'PROPOSAL_INVITE' &&
            payload.type !== 'PROPOSAL_ACCEPTED' &&
            payload.type !== 'PROPOSAL_REJECTED' &&
            payload.type !== 'JOB_INVITE' &&
            payload.type !== 'JOB_INVITE_ACCEPTED' &&
            payload.type !== 'JOB_INVITE_DECLINED' &&
            payload.type !== 'JOB_INVITE_WITHDRAWN' &&
            payload.type !== 'JOB_INVITE_SELECTED' &&
            payload.type !== 'JOB_INVITE_NOT_SELECTED' &&
            payload.type !== 'CHAT_MESSAGE'
          ) {
            return;
          }
          setLatest(payload);
          void queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
          void queryClient.invalidateQueries({ queryKey: ['chat-unread-count', userId] });
          void queryClient.invalidateQueries({ queryKey: ['my-job-invitations'] });
          if (payload.jobId) {
            void queryClient.invalidateQueries({ queryKey: ['job-invitations', payload.jobId] });
          }
          handlerRef.current?.(payload);
        } catch {
          // Bỏ qua message không parse được
        }
      });
    };
    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [isAuthenticated, userId, queryClient]);

  const markRead = useCallback(
    async (id: string) => {
      await notificationsApi.markRead(id);
      await queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
    [queryClient]
  );

  const clear = useCallback(async () => {
    await notificationsApi.markAllRead();
    await queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
  }, [queryClient]);

  return { notifications, latest, unreadCount: feed.data?.unreadCount ?? 0, markRead, clear };
}
