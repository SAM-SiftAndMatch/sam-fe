import { Client } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../../stores/useAuthStore';

export interface PaymentNotification {
  type: string;
  contractId?: string | null;
  paymentId?: string | null;
  amount?: number | null;
  message?: string | null;
  timestamp?: string | null;
}

/**
 * Subscribe kênh notification của user, chỉ forward sự kiện đúng contractId.
 * Dùng để refetch payments khi IPN/release đẩy WS (không polling).
 */
export function usePaymentNotifications(
  contractId: string | undefined,
  onEvent: (n: PaymentNotification) => void
) {
  const { isAuthenticated, user } = useAuthStore();
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;
  const userId = user?.userId;

  useEffect(() => {
    if (!isAuthenticated || !userId || !contractId) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`) as WebSocket,
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      client.subscribe(`/topic/users/${userId}/notifications`, (msg) => {
        try {
          const payload = JSON.parse(msg.body) as PaymentNotification;
          if (payload.contractId === contractId) {
            handlerRef.current(payload);
          }
        } catch {
          // Bỏ qua message không parse được
        }
      });
    };
    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [isAuthenticated, userId, contractId]);
}
