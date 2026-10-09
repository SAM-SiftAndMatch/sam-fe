import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../stores/useAuthStore';

export interface InviteNotification {
  type: string;
  jobId?: string | null;
  jobTitle?: string | null;
  matchScore?: number | null;
  recommendationId?: string | null;
  proposalId?: string | null;
  roomId?: string | null;
  actorName?: string | null;
  message?: string | null;
  timestamp?: string | null;
}

const STORAGE_KEY = 'SAM_INVITE_NOTIFICATIONS';

function loadStored(userId: string): InviteNotification[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InviteNotification[];
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
}

/**
 * Subscribe kênh /topic/users/{userId}/notifications để nhận realtime:
 * - 1_TOUCH_INVITE (client -> dev), DEV_CLAIM (dev -> client), CHAT_OPENED
 * - PROPOSAL_RECEIVED (dev nộp -> client), PROPOSAL_INVITE (client mời -> dev),
 *   PROPOSAL_ACCEPTED (dev đồng ý -> client), PROPOSAL_REJECTED
 * Lưu lại để chuông Header hiển thị + bấm là nhảy đúng job.
 */
export function useInviteNotifications(onEvent?: (n: InviteNotification) => void) {
  const { isAuthenticated, user } = useAuthStore();
  const userId = user?.userId;
  const [notifications, setNotifications] = useState<InviteNotification[]>([]);
  const [latest, setLatest] = useState<InviteNotification | null>(null);
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    setNotifications(loadStored(userId));
  }, [isAuthenticated, userId]);

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
            payload.type !== 'PROPOSAL_REJECTED'
          ) {
            return;
          }
          setNotifications((prev) => {
            const next = [payload, ...prev].slice(0, 20);
            try {
              localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(next));
            } catch {
              // bỏ qua lỗi quota
            }
            return next;
          });
          setLatest(payload);
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
  }, [isAuthenticated, userId]);

  const clear = useCallback(() => {
    setNotifications([]);
    setLatest(null);
    if (userId) {
      try {
        localStorage.removeItem(`${STORAGE_KEY}:${userId}`);
      } catch {
        // ignore
      }
    }
  }, [userId]);

  return { notifications, latest, unreadCount: notifications.length, clear };
}
