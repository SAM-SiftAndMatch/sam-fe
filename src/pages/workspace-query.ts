import type { InfiniteData } from '@tanstack/react-query';
import type { ChatMessage, CursorResult } from '../api/chat';

export const workspaceKeys = {
  summary: (userId: string, roomId: string) => ['workspace', 'summary', userId, roomId] as const,
  messages: (userId: string, roomId: string) => ['workspace', 'messages', userId, roomId] as const,
  timeline: (userId: string, jobId: string) => ['workspace', 'timeline', userId, jobId] as const,
  deliveries: (userId: string, jobId: string) =>
    ['workspace', 'deliveries', userId, jobId] as const,
  reports: (userId: string, jobId: string, taskId: string) =>
    ['workspace', 'reports', userId, jobId, taskId] as const,
};

export type MessagePages = InfiniteData<CursorResult<ChatMessage>, string | null>;

export function appendConfirmedMessage(
  previous: MessagePages | undefined,
  message: ChatMessage
): MessagePages | undefined {
  if (!previous?.pages.length) return previous;
  if (previous.pages.some((page) => page.items.some((item) => item.id === message.id))) {
    return previous;
  }
  return {
    ...previous,
    pages: previous.pages.map((page, index) =>
      index === 0 ? { ...page, items: [...page.items, message] } : page
    ),
  };
}
