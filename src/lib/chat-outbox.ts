import { create } from 'zustand';
import { type ChatAttachment, type ChatMessage, type SendChatMessage, chatApi } from '../api/chat';
import { useAuthStore } from '../stores/useAuthStore';

export type OutboxFile = { file: File; preview?: string; uploaded?: ChatAttachment };
export type OutboxMessage = {
  id: string;
  userId: string;
  roomId: string;
  content: string;
  createdAt: string;
  files: OutboxFile[];
  status: 'uploading' | 'sending' | 'failed' | 'sent';
  progress: number;
  error?: string;
  confirmed?: ChatMessage;
  send: (input: SendChatMessage) => Promise<ChatMessage | undefined>;
};
export const useChatOutbox = create<{ items: OutboxMessage[] }>(() => ({ items: [] }));
const update = (id: string, patch: Partial<OutboxMessage>) =>
  useChatOutbox.setState((state) => ({
    items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  }));
export function discardOutbox(id: string) {
  const item = useChatOutbox.getState().items.find((entry) => entry.id === id);
  for (const file of item?.files ?? []) if (file.preview) URL.revokeObjectURL(file.preview);
  useChatOutbox.setState((state) => ({ items: state.items.filter((entry) => entry.id !== id) }));
}
const running = new Set<string>();
export async function retryOutbox(id: string) {
  const item = useChatOutbox.getState().items.find((entry) => entry.id === id);
  if (
    !item ||
    running.has(id) ||
    item.status === 'sent' ||
    useAuthStore.getState().user?.userId !== item.userId
  )
    return;
  running.add(id);
  update(id, { status: item.files.length ? 'uploading' : 'sending', error: undefined });
  try {
    for (const [index, file] of item.files.entries()) {
      if (!file.uploaded)
        file.uploaded = await chatApi.uploadAttachment(
          item.roomId,
          file.file,
          undefined,
          (percent) =>
            update(id, { progress: Math.round((index * 100 + percent) / item.files.length) })
        );
      if (useAuthStore.getState().user?.userId !== item.userId)
        throw new Error('Phiên đăng nhập đã thay đổi.');
    }
    update(id, { status: 'sending', progress: 100 });
    const confirmed = await item.send({
      content: item.content,
      attachmentIds: item.files.map((file) => file.uploaded!.id),
      clientMessageId: id,
    });
    if (!confirmed) throw new Error('Phiên đăng nhập đã thay đổi.');
    update(id, { status: 'sent', confirmed });
  } catch {
    // A websocket confirmation can arrive before a failed HTTP response.
    if (useChatOutbox.getState().items.some((entry) => entry.id === id))
      update(id, { status: 'failed', error: 'Không gửi được tin nhắn' });
  } finally {
    running.delete(id);
  }
}
export function enqueueChatMessage(
  input: Pick<OutboxMessage, 'userId' | 'roomId' | 'content' | 'send'> & { files: File[] }
) {
  const id = crypto.randomUUID();
  const item: OutboxMessage = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
    status: input.files.length ? 'uploading' : 'sending',
    progress: 0,
    files: input.files.map((file) => ({
      file,
      preview:
        file.type.startsWith('image/') || file.type.startsWith('video/')
          ? URL.createObjectURL(file)
          : undefined,
    })),
  };
  useChatOutbox.setState((state) => ({ items: [...state.items, item] }));
  void retryOutbox(id);
}

// Outbox entries belong to one authenticated account and must not survive logout.
useAuthStore.subscribe((state, previous) => {
  if (state.user?.userId === previous.user?.userId) return;
  for (const item of useChatOutbox.getState().items) {
    if (item.userId !== state.user?.userId) discardOutbox(item.id);
  }
});
