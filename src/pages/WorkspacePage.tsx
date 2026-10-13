import { Client } from '@stomp/stompjs';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { type ChatMessage, type ChatRoom, chatApi } from '../api/chat';
import { type ContractBroadcast, type ContractDetail, contractApi } from '../api/contract';
import AppHeader from '../components/AppHeader';
import ProjectWorkflowPanel from '../components/ProjectWorkflowPanel';
import { useAuthStore } from '../stores/useAuthStore';
import type { JobStatus } from '../types/job';
import { formatMoney } from '../utils/format';

const jobStatusLabel = (status: JobStatus | undefined): string => {
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

const WorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const role = user?.role === 'FREELANCER' ? 'freelancer' : 'client';
  const myId = user?.userId;

  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  // Vừa ký đôi xong nhảy về đây đợi AI thẩm định (ContractPage navigate kèm state)
  const [awaitingReview, setAwaitingReview] = useState(
    () => (location.state as { awaitingReview?: boolean } | null)?.awaitingReview === true
  );
  const stompRef = useRef<Client | null>(null);
  const contractSubRef = useRef<{ unsubscribe: () => void } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Hợp đồng: panel gọn trong chat chỉ hiện giá + 2 tên + nút mở màn sửa full-screen
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [contractLoading, setContractLoading] = useState(false);

  // Resolve phòng: param có thể là roomId (chuẩn mới) hoặc jobId (luồng cũ)
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setRoomError(null);
    setRoom(null);
    setMessages([]);
    setContract(null);
    chatApi
      .getRoomDetail(projectId)
      .catch(() => chatApi.getRoomByJob(projectId))
      .then((r) => {
        if (!cancelled) setRoom(r);
      })
      .catch(() => {
        if (!cancelled)
          setRoomError('Không tìm thấy phòng chat. Hãy chắc chắn bạn đã bắt tay 1 chạm trước.');
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const { refetch: refetchHistory } = useQuery({
    queryKey: ['chat-history', room?.id],
    queryFn: () => chatApi.getHistory(room!.id),
    enabled: !!room?.id,
    retry: false,
  });

  useEffect(() => {
    if (!room?.id) return;
    chatApi
      .getHistory(room.id)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [room?.id]);

  // WS realtime: 1 client duy nhất cho cả chat + hợp đồng.
  // Phụ thuộc cả contract?.id để khi hợp đồng vừa được tạo/xong thì nối lại và
  // subscribe kênh /topic/contracts/{id} (tránh race: contract về trước WS nối xong).
  useEffect(() => {
    if (!room?.id) return;
    const roomId = room.id;
    const currentContractId = contract?.id;
    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`) as WebSocket,
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      client.subscribe(`/topic/chat/${roomId}`, (msg) => {
        try {
          const payload = JSON.parse(msg.body) as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.id)) return prev;
            return [...prev, payload];
          });
          // AI thẩm định xong (tin hệ thống tới) → tắt banner chờ
          if (payload.system) setAwaitingReview(false);
        } catch {
          // bỏ qua
        }
      });
      if (currentContractId) {
        subscribeContract(client, currentContractId);
      }
    };
    client.activate();
    stompRef.current = client;
    return () => {
      contractSubRef.current?.unsubscribe();
      contractSubRef.current = null;
      void client.deactivate();
      if (stompRef.current === client) stompRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, contract?.id]);

  // Tự tắt banner chờ sau 2 phút nếu AI lâu (tránh kẹt màn hình)
  useEffect(() => {
    if (!awaitingReview) return;
    const t = setTimeout(() => setAwaitingReview(false), 120000);
    return () => clearTimeout(t);
  }, [awaitingReview]);
  useEffect(() => {
    if (!room?.id) return;
    let cancelled = false;
    setContractLoading(true);
    contractApi
      .getContractByRoom(room.id)
      .then((c) => {
        if (!cancelled) setContract(c);
      })
      .catch(() => {
        // NO_CONTRACT hoặc lỗi mạng -> panel hiện nút mở màn hợp đồng
      })
      .finally(() => {
        if (!cancelled) setContractLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [room?.id]);

  const subscribeContract = (client: Client, contractId: string) => {
    contractSubRef.current?.unsubscribe();
    const sub = client.subscribe(`/topic/contracts/${contractId}`, (msg) => {
      try {
        const payload = JSON.parse(msg.body) as ContractBroadcast;
        setContract((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            agreedAmount: payload.agreedAmount ?? prev.agreedAmount,
            termsAndConditions: payload.termsAndConditions ?? prev.termsAndConditions,
            clientAgreed: payload.clientAgreed ?? prev.clientAgreed,
            freelancerAgreed: payload.freelancerAgreed ?? prev.freelancerAgreed,
            status: payload.contractStatus ?? prev.status,
          };
        });
        if (payload.contractStatus === 'ACTIVE') {
          setRoom((prev) =>
            prev ? { ...prev, jobStatus: 'AWAITING_PAYMENT', contractStatus: 'ACTIVE' } : prev
          );
        }
      } catch {
        // bỏ qua
      }
    });
    contractSubRef.current = sub;
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !room?.id || !myId || sending) return;
    const client = stompRef.current;
    if (!client?.active) {
      // Fallback: reload lịch sử nếu WS chưa nối
      void refetchHistory().then((r) => {
        if (r.data) setMessages(r.data);
      });
      return;
    }
    setSending(true);
    try {
      client.publish({
        destination: `/app/chat/${room.id}/send`,
        body: JSON.stringify({ senderId: myId, content: text }),
      });
      setInput('');
    } finally {
      setSending(false);
    }
  };

  const otherName =
    role === 'client' ? room?.freelancerName || 'Freelancer' : room?.clientName || 'Khách hàng';

  return (
    <div className="h-screen bg-[#F8FAFC] font-sans flex flex-col overflow-hidden">
      <AppHeader />

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* ================= CỘT TRÁI ================= */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6 lg:h-full lg:overflow-y-auto lg:pr-2 hidden lg:flex">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {(room?.jobTitle || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight line-clamp-1">
                {room?.jobTitle || 'Đang tải...'}
              </h2>
              <span className="text-[10px] font-bold text-[#1D4ED8] tracking-widest uppercase">
                {jobStatusLabel(room?.jobStatus)}
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white shadow-[0_4px_15px_rgba(29,78,216,0.3)] transition-all cursor-pointer border-0 text-left"
            >
              <span className="font-semibold text-sm">Tin nhắn</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/workspace/${room?.id ?? projectId}/timeline`)}
              className="workspace-back-button flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition-all cursor-pointer border-0 text-left"
            >
              <span className="font-medium text-sm">Tiến độ dự án</span>
            </button>
          </nav>
        </aside>

        {/* ================= CỘT GIỮA (CHAT AREA) ================= */}
        <section className="flex-1 flex flex-col min-w-0 h-full border border-gray-100 bg-white/50 backdrop-blur-sm rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-[32px] shadow-sm z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-[#EEF2FF] text-[#1D4ED8] rounded-full overflow-hidden shrink-0 flex items-center justify-center font-black text-xl">
                  {otherName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">{otherName}</h3>
                <p className="text-[11px] font-bold text-gray-400">
                  {room ? `Dự án: ${room.jobTitle}` : 'Đang tải phòng chat...'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/workspace/${room?.id ?? projectId}/timeline`)}
              className="lg:hidden shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700 border-0 cursor-pointer"
            >
              Tiến độ
            </button>
          </div>

          {/* Thanh hợp đồng ghim cố định — không trôi theo đoạn chat */}
          {!roomError && room && (
            <div className="bg-white px-6 py-3 border-b border-gray-100 flex items-center gap-4 shadow-sm z-10">
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-gray-900">Hợp đồng</span>
                {contractLoading ? (
                  <span className="block text-xs text-gray-400">Đang tải...</span>
                ) : contract ? (
                  <>
                    <span className="block text-sm font-black text-[#1D4ED8]">
                      Giá thỏa thuận: {formatMoney(Number(contract.agreedAmount))} đ
                    </span>
                    <span className="block text-xs text-gray-500 truncate">
                      {contract.clientName} • {contract.freelancerName}
                    </span>
                  </>
                ) : (
                  <span className="block text-xs text-gray-500">
                    Chưa có hợp đồng cho phòng này
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => navigate(`/workspace/${room.id}/contract`)}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#153bb5] text-white font-bold text-xs shadow-md transition-colors cursor-pointer border-0"
              >
                {contract?.reviewStatus === 'NEEDS_CONFIRM'
                  ? 'Xem AI thẩm định'
                  : contract?.status === 'DRAFT'
                    ? 'Sửa hợp đồng'
                    : contract
                      ? 'Xem hợp đồng'
                      : 'Mở hợp đồng'}
              </button>
            </div>
          )}

          {/* Banner chờ AI thẩm định sau khi ký đôi (tự tắt khi tin AI tới) */}
          {awaitingReview && room && !roomError && (
            <div className="mx-6 mt-4 rounded-2xl px-5 py-4 bg-gradient-to-r from-violet-600 to-[#1D4ED8] text-white shadow-lg animate-rise">
              <div className="flex-1">
                <p className="text-sm font-bold">Đã đủ 2 chữ ký! AI đang thẩm định hợp đồng...</p>
                <p className="text-xs text-white/75">
                  Kết quả sẽ hiện ngay dưới dạng tin nhắn hệ thống, bạn không cần làm gì thêm.
                </p>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 hide-scrollbar">
            {roomError ? (
              <div className="text-center py-16">
                <p className="text-sm text-red-600 font-semibold mb-2">{roomError}</p>
                <button
                  type="button"
                  onClick={() => navigate('/workspaces')}
                  className="text-sm font-bold text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Về danh sách tin nhắn
                </button>
              </div>
            ) : !room ? (
              <p className="text-center text-sm text-gray-400 py-16">Đang tải phòng chat...</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-gray-500 mb-1">
                  Bắt tay thành công! Đây là phòng thương lượng của 2 bên.
                </p>
                <p className="text-xs text-gray-400">
                  Nhắn câu chào đầu tiên để bắt đầu chốt giá, tiến độ...
                </p>
              </div>
            ) : (
              messages.map((m) => {
                // Tin hệ thống/AI: bong bóng riêng ở giữa — icon + màu khác hẳn tin người
                if (m.system) {
                  return (
                    <div key={m.id} className="flex justify-center animate-rise">
                      <div className="max-w-[90%] bg-gradient-to-br from-violet-600 via-[#6D28D9] to-[#1D4ED8] text-white rounded-3xl px-5 py-4 shadow-lg">
                        <p className="text-[11px] font-black uppercase tracking-widest text-white/80 mb-1.5">
                          SAM AI hệ thống
                        </p>
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                          {m.content.replace(/^🤖\s*/, '')}
                        </p>
                        {m.createdAt && (
                          <p className="text-[10px] text-white/60 mt-1.5 text-right">
                            {new Date(m.createdAt).toLocaleString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
                const mine = m.senderId === myId;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col gap-1.5 max-w-[80%] ${mine ? 'items-end self-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        mine
                          ? 'bg-[#1D4ED8] text-white rounded-tr-sm shadow-md'
                          : 'bg-white text-gray-800 rounded-tl-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100'
                      }`}
                    >
                      {m.content}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {m.senderName}
                      {m.createdAt ? ` • ${new Date(m.createdAt).toLocaleString('vi-VN')}` : ''}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-6 bg-transparent">
            <div className="bg-white border border-gray-200 rounded-[28px] p-2 flex flex-col shadow-[0_10px_30px_rgb(0,0,0,0.05)] focus-within:border-[#1D4ED8] transition-all">
              <div className="flex items-end gap-2 px-3 pb-2 pt-1">
                <input
                  type="text"
                  aria-label="Nhập nội dung tin nhắn"
                  placeholder={
                    room ? 'Nhập nội dung tin nhắn của bạn...' : 'Đang tải phòng chat...'
                  }
                  value={input}
                  disabled={!room}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                  className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-2 outline-none text-gray-700 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!room || !input.trim()}
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
        </section>

        {/* Timeline và sản phẩm bàn giao lấy từ dữ liệu workflow thật */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4 lg:h-full lg:overflow-y-auto lg:pr-2 pb-10 lg:pb-0 lg:hidden xl:flex">
          {room && (
            <ProjectWorkflowPanel
              jobId={room.jobId}
              jobStatus={room.jobStatus}
              role={role}
              onSettlementCompleted={() =>
                setRoom((current) => (current ? { ...current, jobStatus: 'COMPLETED' } : current))
              }
            />
          )}
        </aside>
      </main>
    </div>
  );
};

export default WorkspacePage;
