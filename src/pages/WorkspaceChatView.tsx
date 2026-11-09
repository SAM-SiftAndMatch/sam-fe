import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { ListChecks, Menu } from 'lucide-react';
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { type ChatMessage, chatApi } from '../api/chat';
import { workflowApi } from '../api/workflow';
import ChatComposer from '../components/chat/ChatComposer';
import ChatMessageAttachments from '../components/chat/ChatMessageAttachments';
import WorkspacePanelDrawer from '../components/chat/WorkspacePanelDrawer';
import WorkspaceResourcesPanel from '../components/chat/WorkspaceResourcesPanel';
import { formatMoney } from '../utils/format';
import type { WorkspaceContext } from './WorkspaceLayout';
import { workspaceKeys } from './workspace-query';

const ChatBubble = memo(function ChatBubble({
  message,
  myId,
  onImageLoad,
}: { message: ChatMessage; myId: string; onImageLoad: () => void }) {
  if (message.system) {
    return (
      <div className="flex justify-center">
        <div className="workspace-system-message max-w-[90%] bg-gradient-to-br from-violet-600 via-[#6D28D9] to-[#1D4ED8] text-white rounded-3xl px-5 py-4 shadow-none">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/80 mb-1.5">
            SAM AI hệ thống
          </p>
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
            {message.content.replace(/^🤖\s*/, '')}
          </p>
          {message.createdAt && (
            <p className="text-[10px] text-white/60 mt-1.5 text-right">
              {new Date(message.createdAt).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
      </div>
    );
  }
  const mine = message.senderId === myId;
  return (
    <div
      className={`flex min-w-0 flex-col gap-1.5 max-w-[80%] ${mine ? 'items-end self-end' : 'items-start'}`}
    >
      {message.content && (
        <div
          className={`max-w-full rounded-2xl p-4 text-sm leading-relaxed ${mine ? 'rounded-tr-sm bg-[#1D4ED8] text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-gray-800'}`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      )}
      {!!message.attachments?.length && (
        <ChatMessageAttachments
          roomId={message.roomId}
          readerId={myId}
          attachments={message.attachments}
          alignEnd={mine}
          onImageLoad={onImageLoad}
        />
      )}
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {message.senderName}
        {message.createdAt ? ` • ${new Date(message.createdAt).toLocaleString('vi-VN')}` : ''}
      </div>
    </div>
  );
});

function useWideWorkspace() {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1280px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const update = () => setWide(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return wide;
}

function WorkflowPreview({ context }: { context: WorkspaceContext }) {
  const { summary, userId } = context;
  const navigate = useNavigate();
  const enabled = summary.jobStatus === 'IN_PROGRESS' || summary.jobStatus === 'COMPLETED';
  const { data: timeline } = useQuery({
    queryKey: workspaceKeys.timeline(userId, summary.jobId),
    queryFn: () => workflowApi.getTimelineSummary(summary.jobId),
    enabled,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <h3 className="text-[17px] font-bold text-gray-900">Tiến độ dự án</h3>
      {timeline ? (
        <>
          <div className="flex justify-between text-xs text-gray-500 mt-4 mb-2">
            <span>
              Tuần {timeline.currentWeek}/{timeline.totalWeeks}
            </span>
            <span>{timeline.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${timeline.progress}%` }} />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {timeline.tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="rounded-xl border-l-2 border-slate-200 bg-slate-50 p-3 text-xs text-gray-700"
              >
                <p className="font-semibold line-clamp-2">{task.title}</p>
                <p className="mt-1 text-gray-500">
                  Tuần {task.weekNumber} · {task.progress}%
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-3 text-xs text-gray-500">
          {enabled ? 'Đang tải tiến độ...' : 'Timeline bắt đầu sau khi dự án được nạp tiền.'}
        </p>
      )}
      <button
        type="button"
        onClick={() => navigate(`/workspace/${summary.roomId}/timeline`)}
        className="mt-4 text-xs font-bold text-blue-700 bg-transparent border-0 cursor-pointer"
      >
        Xem toàn bộ tiến độ
      </button>
    </div>
  );
}

export default function WorkspaceChatView() {
  const context = useOutletContext<WorkspaceContext>();
  const { summary, userId, role, workspacesPage } = context;
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const wide = useWideWorkspace();
  const [sidePanel, setSidePanel] = useState<'timeline' | 'resources' | null>(null);
  const [awaitingReview, setAwaitingReview] = useState(
    () => (location.state as { awaitingReview?: boolean } | null)?.awaitingReview === true
  );
  const messagesQuery = useInfiniteQuery({
    queryKey: workspaceKeys.messages(userId, summary.roomId),
    queryFn: ({ pageParam }) =>
      chatApi.getHistoryPage(summary.roomId, {
        before: pageParam ?? undefined,
        size: 30,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 30_000,
  });
  const messages = useMemo(
    () => [...(messagesQuery.data?.pages ?? [])].reverse().flatMap((page) => page.items),
    [messagesQuery.data]
  );
  const latestMessageId = messages.at(-1)?.id;
  useEffect(() => {
    if (!messagesQuery.isSuccess) return;
    void chatApi.markRoomRead(summary.roomId).then(() => {
      void queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
      void queryClient.invalidateQueries({ queryKey: ['user-notifications', 'recent'] });
    });
  }, [messagesQuery.isSuccess, summary.roomId, latestMessageId, queryClient]);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldScrollBottom = useRef(true);
  const restoreRef = useRef<{ top: number; height: number } | null>(null);
  const previousTop = useRef(0);
  const previousLastId = useRef<string | undefined>(undefined);
  const initializedScroll = useRef(false);
  const otherName = role === 'client' ? summary.freelancerName : summary.clientName;
  const canOpenContract =
    role === 'client'
      ? !summary.selectedFreelancerId || summary.selectedFreelancerId === summary.freelancerId
      : summary.selectedFreelancerId === userId;
  const canChat =
    !summary.selectedFreelancerId || summary.selectedFreelancerId === summary.freelancerId;

  useEffect(() => {
    if (!awaitingReview) return;
    const timeout = window.setTimeout(() => setAwaitingReview(false), 120_000);
    return () => window.clearTimeout(timeout);
  }, [awaitingReview]);
  useEffect(() => {
    if (messages.at(-1)?.system) setAwaitingReview(false);
  }, [messages]);
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (restoreRef.current) {
      container.scrollTop =
        restoreRef.current.top + container.scrollHeight - restoreRef.current.height;
      restoreRef.current = null;
      return;
    }
    const lastId = messages.at(-1)?.id;
    if (lastId && !initializedScroll.current) {
      const saved = context.getScrollTop();
      if (saved !== undefined) {
        container.scrollTop = saved;
        shouldScrollBottom.current = container.scrollHeight - saved - container.clientHeight < 120;
      } else bottomRef.current?.scrollIntoView();
      previousLastId.current = lastId;
      initializedScroll.current = true;
      return;
    }
    if (lastId && lastId !== previousLastId.current && shouldScrollBottom.current) {
      bottomRef.current?.scrollIntoView();
    }
    previousLastId.current = lastId;
  }, [messages]);

  const loadOlder = () => {
    const container = containerRef.current;
    if (!messagesQuery.hasNextPage || messagesQuery.isFetchingNextPage || !container) return;
    restoreRef.current = { top: container.scrollTop, height: container.scrollHeight };
    shouldScrollBottom.current = false;
    void messagesQuery.fetchNextPage().then((result) => {
      if (result.isError) restoreRef.current = null;
    });
  };

  const panelControls = (
    <div className="flex items-center gap-1" aria-label="Chọn thông tin cuộc hội thoại">
      {(
        [
          ['resources', 'Xem ảnh, tệp và liên kết đã gửi', Menu],
          ['timeline', 'Xem tiến độ thu nhỏ', ListChecks],
        ] as const
      ).map(([value, label, Icon]) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          title={label}
          aria-pressed={sidePanel === value}
          aria-expanded={sidePanel === value}
          onClick={() => setSidePanel((current) => (current === value ? null : value))}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${sidePanel === value ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Icon size={19} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
  const panelContent =
    sidePanel === 'timeline' ? (
      <WorkflowPreview context={context} />
    ) : (
      <WorkspaceResourcesPanel
        key={`${userId}:${summary.roomId}`}
        roomId={summary.roomId}
        userId={userId}
      />
    );

  return (
    <>
      <section className="workspace-chat flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[32px] bg-white">
        <div className="workspace-section-header relative z-10 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="w-12 h-12 shrink-0 bg-[#EEF2FF] text-[#1D4ED8] rounded-full flex items-center justify-center font-extrabold text-xl">
              {otherName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3
                title={otherName}
                className="mb-1 truncate text-lg font-bold leading-none text-gray-900"
              >
                {otherName}
              </h3>
              <p title={summary.jobTitle} className="truncate text-[11px] font-bold text-gray-400">
                Dự án: {summary.jobTitle}
              </p>
            </div>
          </div>
          {panelControls}
        </div>
        <div className="flex shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-gray-900">Hợp đồng</span>
            {summary.contractId ? (
              <>
                <span className="block text-sm font-extrabold text-[#1D4ED8]">
                  Giá thỏa thuận: {formatMoney(Number(summary.agreedAmount))} đ
                </span>
                <span className="block text-xs text-gray-500 truncate">
                  {summary.clientName} • {summary.freelancerName}
                </span>
              </>
            ) : (
              <span className="block text-xs text-gray-500">Chưa có hợp đồng cho phòng này</span>
            )}
          </span>
          {canOpenContract ? (
            <button
              type="button"
              onClick={() =>
                navigate(`/workspace/${summary.roomId}/contract`, {
                  state: { workspacesPage },
                })
              }
              className="shrink-0 px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#153bb5] text-white font-bold text-xs shadow-none border-0 cursor-pointer"
            >
              {summary.reviewStatus === 'NEEDS_CONFIRM'
                ? 'Xem AI thẩm định'
                : summary.contractStatus === 'DRAFT'
                  ? 'Sửa hợp đồng'
                  : summary.contractId
                    ? 'Xem hợp đồng'
                    : 'Mở hợp đồng'}
            </button>
          ) : (
            <span className="shrink-0 text-xs font-medium text-gray-500">
              Dự án đã chọn freelancer khác
            </span>
          )}
        </div>
        {awaitingReview && (
          <div className="workspace-system-message mx-6 mt-4 rounded-2xl px-5 py-4 bg-gradient-to-r from-violet-600 to-[#1D4ED8] text-white shadow-none">
            <p className="text-sm font-bold">Đã đủ 2 chữ ký! AI đang thẩm định hợp đồng...</p>
            <p className="text-xs text-white/75">Kết quả sẽ hiện dưới dạng tin nhắn hệ thống.</p>
          </div>
        )}
        <div
          ref={containerRef}
          onScroll={(event) => {
            const container = event.currentTarget;
            const movingUp = container.scrollTop < previousTop.current;
            previousTop.current = container.scrollTop;
            if (messages.length) context.saveScrollTop(container.scrollTop);
            shouldScrollBottom.current =
              container.scrollHeight - container.scrollTop - container.clientHeight < 120;
            if (movingUp && container.scrollTop < 80) loadOlder();
          }}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 p-4 md:p-6"
        >
          {messagesQuery.isFetchingNextPage && (
            <p className="self-center text-xs text-gray-400">Đang tải tin cũ...</p>
          )}
          {messagesQuery.isError && (
            <div className="text-center text-xs text-red-600">
              <p>Không tải được tin nhắn.</p>
              <button
                type="button"
                onClick={() => void messagesQuery.refetch()}
                className="underline"
              >
                Thử lại
              </button>
            </div>
          )}
          {messagesQuery.isPending ? (
            <p className="text-center text-sm text-gray-400 py-16">Đang tải tin nhắn...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-16">
              Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện.
            </p>
          ) : (
            messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                myId={userId}
                onImageLoad={() => {
                  if (shouldScrollBottom.current) bottomRef.current?.scrollIntoView();
                }}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
        {canChat ? (
          <ChatComposer
            key={`${userId}:${summary.roomId}`}
            roomId={summary.roomId}
            getDraft={context.getDraft}
            saveDraft={context.saveDraft}
            sendMessage={context.sendMessage}
          />
        ) : (
          <p className="px-6 py-4 text-center text-sm text-gray-600">
            Dự án đã chọn freelancer khác. Phòng chat này được giữ để xem lại trao đổi trước đó.
          </p>
        )}
      </section>
      {wide && sidePanel !== null && (
        <aside
          className="workspace-context-sidebar ml-3 flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-100"
          aria-label="Thông tin cuộc hội thoại"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{panelContent}</div>
        </aside>
      )}
      {!wide && sidePanel !== null && (
        <WorkspacePanelDrawer controls={panelControls} onClose={() => setSidePanel(null)}>
          {panelContent}
        </WorkspacePanelDrawer>
      )}
    </>
  );
}
