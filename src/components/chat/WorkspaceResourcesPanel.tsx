import { useInfiniteQuery } from '@tanstack/react-query';
import { Image, Link as LinkIcon, LoaderCircle, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { type SharedChatAttachment, type SharedChatLinks, chatApi } from '../../api/chat';
import { parseSharedChatLink } from '../../lib/chat-links';
import { workspaceKeys } from '../../pages/workspace-query';
import type { PageResult } from '../../types/api';
import { ChatAttachmentItem } from './ChatMessageAttachments';

type Category = 'images' | 'files' | 'links';
const categories = [
  { value: 'images', label: 'Ảnh', icon: Image },
  { value: 'files', label: 'Tệp', icon: Paperclip },
  { value: 'links', label: 'Liên kết', icon: LinkIcon },
] as const;
const empty = {
  images: 'Chưa có ảnh nào được gửi trong cuộc hội thoại này.',
  files: 'Chưa có tệp nào được gửi trong cuộc hội thoại này.',
  links: 'Chưa có liên kết nào được gửi trong cuộc hội thoại này.',
};
const formatDate = (value: string) => new Date(value).toLocaleDateString('vi-VN');

export default function WorkspaceResourcesPanel({
  roomId,
  userId,
}: { roomId: string; userId: string }) {
  const [category, setCategory] = useState<Category>('images');
  const query = useInfiniteQuery({
    queryKey: [...workspaceKeys.resources(userId, roomId), category],
    queryFn: async ({ pageParam }): Promise<PageResult<SharedChatAttachment | SharedChatLinks>> =>
      category === 'links'
        ? chatApi.getSharedLinks(roomId, pageParam)
        : chatApi.getSharedAttachments(roomId, category, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    staleTime: 15_000,
  });
  const items = [
    ...new Map(
      (query.data?.pages.flatMap((page) => page.items) ?? []).map(
        (item) => ['links' in item ? item.messageId : item.id, item] as const
      )
    ).values(),
  ];
  const attachments = items.filter((item): item is SharedChatAttachment => !('links' in item));
  const links = items.flatMap((item) =>
    'links' in item
      ? item.links.flatMap((value) => {
          const link = parseSharedChatLink(value);
          return link
            ? [
                {
                  ...link,
                  messageId: item.messageId,
                  senderName: item.senderName,
                  sentAt: item.sentAt,
                },
              ]
            : [];
        })
      : []
  );
  const isEmpty = category === 'links' ? links.length === 0 : attachments.length === 0;
  return (
    <section aria-label="Ảnh, tệp và liên kết đã chia sẻ" className="min-w-0">
      <h3 className="text-base font-bold text-slate-900">Đã chia sẻ</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Ảnh, tệp và liên kết trong cuộc hội thoại này.
      </p>
      <div
        className="mb-5 mt-4 grid grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-white p-1"
        aria-label="Loại nội dung đã chia sẻ"
      >
        {categories.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
            className={`flex items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-semibold transition-colors ${category === value ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      {query.isPending ? (
        <p className="py-8 text-center text-xs text-slate-500" aria-live="polite">
          Đang tải nội dung đã chia sẻ...
        </p>
      ) : query.isError && !query.data ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          Không tải được nội dung.{' '}
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="font-semibold underline"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {isEmpty && (
            <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-xs leading-6 text-slate-500">
              {empty[category]}
            </p>
          )}
          {category !== 'links' && (
            <div className={category === 'images' ? 'grid grid-cols-2 gap-2' : 'space-y-3'}>
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="min-w-0"
                  title={`Gửi ngày ${formatDate(attachment.sentAt)}`}
                >
                  <ChatAttachmentItem
                    roomId={roomId}
                    readerId={userId}
                    attachment={attachment}
                    thumbnail={category === 'images'}
                  />
                  {category === 'files' && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      {formatDate(attachment.sentAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {category === 'links' && (
            <div className="space-y-3">
              {links.map((item) => (
                <a
                  key={`${item.messageId}:${item.url}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-blue-300"
                >
                  <LinkIcon
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-blue-700">
                      {item.hostname}
                    </span>
                    <span className="mt-1 block break-all text-xs leading-5 text-slate-600">
                      {item.url}
                    </span>
                    <span className="mt-2 block text-[10px] text-slate-400">
                      {item.senderName} · {formatDate(item.sentAt)}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </>
      )}
      {query.hasNextPage && (
        <button
          type="button"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-blue-700 disabled:opacity-50"
        >
          {query.isFetchingNextPage && <LoaderCircle size={14} className="animate-spin" />}
          {query.isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
        </button>
      )}
      {query.isFetchNextPageError && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          Chưa tải được nội dung cũ hơn. Bạn có thể bấm Xem thêm để thử lại.
        </p>
      )}
    </section>
  );
}
