import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { type ChatMessage, chatApi } from '../api/chat';
import { workflowApi } from '../api/workflow';
import { formatMoney } from '../utils/format';
import type { WorkspaceContext } from './WorkspaceLayout';
import { workspaceKeys } from './workspace-query';

const ChatComposer = memo(function ChatComposer({
  getDraft,
  saveDraft,
  sendMessage,
}: Pick<WorkspaceContext, 'getDraft' | 'saveDraft' | 'sendMessage'>) {
  const [input, setInput] = useState(getDraft);
  const [connectionError, setConnectionError] = useState(false);
  const send = () => {
    const content = input.trim();
    if (!content) return;
    if (!sendMessage(content)) {
      setConnectionError(true);
      return;
    }
    setConnectionError(false);
    setInput('');
    saveDraft('');
  };
  return (
    <div className="p-6 bg-transparent">
      {connectionError && (
        <p className="mb-2 text-xs text-red-600">Đang kết nối lại. Hãy thử gửi sau giây lát.</p>
      )}
      <div className="bg-white border border-gray-200 rounded-[28px] p-2 flex flex-col shadow-[0_10px_30px_rgb(0,0,0,0.05)] focus-within:border-[#1D4ED8] transition-all">
        <div className="flex items-end gap-2 px-3 pb-2 pt-1">
          <input
            type="text"
            aria-label="Nhập nội dung tin nhắn"
            placeholder="Nhập nội dung tin nhắn của bạn..."
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              saveDraft(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') send();
            }}
            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-2 outline-none text-gray-700 placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim()}
            className="w-10 h-10 bg-[#1D4ED8] hover:bg-[#00B2FF] text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-md cursor-pointer border-0 disabled:opacity-50"
            aria-label="Gửi tin nhắn"
          >
            <svg
              className="w-4 h-4 ml-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

const ChatBubble = memo(function ChatBubble({
  message,
  myId,
}: { message: ChatMessage; myId: string }) {
  if (message.system) {
    return (
      <div className="flex justify-center">
        <div className="workspace-system-message max-w-[90%] bg-gradient-to-br from-violet-600 via-[#6D28D9] to-[#1D4ED8] text-white rounded-3xl px-5 py-4 shadow-lg">
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
      className={`flex flex-col gap-1.5 max-w-[80%] ${mine ? 'items-end self-end' : 'items-start'}`}
    >
      <div
        className={`p-4 rounded-2xl text-sm leading-relaxed ${mine ? 'bg-[#1D4ED8] text-white rounded-tr-sm shadow-md' : 'bg-white text-gray-800 rounded-tl-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100'}`}
      >
        {message.content}
      </div>
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
    <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
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
              <div key={task.id} className="rounded-xl bg-slate-50 p-3 text-xs text-gray-700">
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
      if (saved !== undefined) container.scrollTop = saved;
      else bottomRef.current?.scrollIntoView();
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

  return (
    <>
      <section className="flex-1 flex flex-col min-w-0 h-full border border-gray-100 bg-white/50 backdrop-blur-sm rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-[32px] shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#EEF2FF] text-[#1D4ED8] rounded-full flex items-center justify-center font-extrabold text-xl">
              {otherName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">{otherName}</h3>
              <p className="text-[11px] font-bold text-gray-400">Dự án: {summary.jobTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/workspace/${summary.roomId}/timeline`)}
            className="lg:hidden shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700 border-0 cursor-pointer"
          >
            Tiến độ
          </button>
        </div>
        <div className="bg-white px-6 py-3 border-b border-gray-100 flex items-center gap-4 shadow-sm z-10">
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
              className="shrink-0 px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#153bb5] text-white font-bold text-xs shadow-md border-0 cursor-pointer"
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
          <div className="workspace-system-message mx-6 mt-4 rounded-2xl px-5 py-4 bg-gradient-to-r from-violet-600 to-[#1D4ED8] text-white shadow-lg">
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
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 hide-scrollbar"
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
              <ChatBubble key={message.id} message={message} myId={userId} />
            ))
          )}
          <div ref={bottomRef} />
        </div>
        {canChat ? (
          <ChatComposer
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
      {wide && (
        <aside className="w-80 shrink-0 flex flex-col gap-4 h-full overflow-y-auto pr-2">
          <WorkflowPreview context={context} />
        </aside>
      )}
    </>
  );
}
