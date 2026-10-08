import { Client } from '@stomp/stompjs';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { type ChatRoom, chatApi } from '../api/chat';
import {
  type ContractBroadcast,
  type ContractDetail,
  type ContractRevision,
  contractApi,
} from '../api/contract';
import { paymentApi } from '../api/payment';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import ContractMarkdown from '../components/ContractMarkdown';
import Footer from '../components/Footer';
import FundingPanel from '../components/FundingPanel';
import Header from '../components/Header';
import { useAuthStore } from '../stores/useAuthStore';
import { diffLines } from '../utils/diff';
import { formatMoney } from '../utils/format';

const ContractPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role === 'FREELANCER' ? 'freelancer' : 'client';
  const myId = user?.userId;

  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editTerms, setEditTerms] = useState('');
  const stompRef = useRef<Client | null>(null);
  // Field nào đang dở tay (dirty) thì chỉ sync field đó; field còn lại vẫn nhận live từ bên kia
  const dirtyRef = useRef({ amount: false, terms: false });
  const isEditingRef = useRef(false);
  const pendingRef = useRef(false);
  const [saveState, setSaveState] = useState<'idle' | 'typing' | 'saving' | 'saved'>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const termsRef = useRef<HTMLTextAreaElement | null>(null);
  // Tab văn bản / lịch sử + bản đang chọn để so sánh với hiện tại
  const [docTab, setDocTab] = useState<'doc' | 'history'>('doc');
  const [revisions, setRevisions] = useState<ContractRevision[]>([]);
  const [selectedRevId, setSelectedRevId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [fundingNotice, setFundingNotice] = useState<string | null>(null);

  // VNPay redirect về (chữa cháy thay IPN như mua gói): FE tự gọi confirm
  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    if (!responseCode) return;
    const raw = localStorage.getItem('SAM_PENDING_FUNDING');
    localStorage.removeItem('SAM_PENDING_FUNDING');
    // Xóa query VNPay khỏi URL cho sạch
    setSearchParams({}, { replace: true });
    if (responseCode !== '00') {
      setFundingNotice('Thanh toán VNPay chưa hoàn tất, bạn có thể thử lại.');
      return;
    }
    if (!raw) return;
    try {
      const pending = JSON.parse(raw) as { paymentId?: string };
      if (!pending.paymentId) return;
      const txnRef = searchParams.get('vnp_TxnRef');
      const amountParam = searchParams.get('vnp_Amount');
      paymentApi
        .confirmPayment(pending.paymentId, {
          txnRef,
          amountVnd: amountParam ? Number.parseInt(amountParam, 10) : null,
        })
        .then(() => {
          setFundingNotice('Đã ghi nhận chuyển tiền! Bảng nạp tiền bên dưới tự cập nhật.');
        })
        .catch(() => {
          setFundingNotice(
            'VNPay báo thành công nhưng chưa ghi nhận được, bấm Tải lại ở bảng nạp tiền.'
          );
        });
    } catch {
      // payload local hỏng thì thôi
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve phòng (roomId hoặc jobId) rồi tải hợp đồng
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setLoading(true);
    setRoomError(null);
    chatApi
      .getRoomDetail(projectId)
      .catch(() => chatApi.getRoomByJob(projectId))
      .then((r) => {
        if (cancelled) return null;
        setRoom(r);
        return contractApi.getContractByRoom(r.id).catch((e) => {
          if (e instanceof Error && e.message === 'NO_CONTRACT') return null;
          throw e;
        });
      })
      .then((c) => {
        if (!cancelled) setContract(c);
      })
      .catch(() => {
        if (!cancelled) setRoomError('Không tìm thấy phòng chat hoặc hợp đồng.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Realtime hợp đồng
  useEffect(() => {
    if (!contract?.id) return;
    const contractId = contract.id;
    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`) as WebSocket,
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      client.subscribe(`/topic/contracts/${contractId}`, (msg) => {
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
              reviewStatus: payload.reviewStatus ?? prev.reviewStatus,
              reviewNote: payload.reviewNote ?? prev.reviewNote,
              clientKeepConfirmed: payload.clientKeepConfirmed ?? prev.clientKeepConfirmed,
              freelancerKeepConfirmed:
                payload.freelancerKeepConfirmed ?? prev.freelancerKeepConfirmed,
            };
          });
          // KHÔNG đá khỏi editor: field nào mình không đụng thì cập nhật live theo bên kia,
          // field đang gõ dở giữ nguyên để không mất chữ
          if (isEditingRef.current) {
            const d = dirtyRef.current;
            if (!d.amount && payload.agreedAmount != null) {
              setEditAmount(String(payload.agreedAmount));
            }
            if (!d.terms && payload.termsAndConditions != null) {
              setEditTerms(payload.termsAndConditions);
            }
          }
          if (pendingRef.current) {
            pendingRef.current = false;
            setSavedAt(new Date().toLocaleTimeString('vi-VN'));
            setSaveState('saved');
          }
        } catch {
          // bỏ qua
        }
      });
    };
    client.activate();
    stompRef.current = client;
    return () => {
      void client.deactivate();
      if (stompRef.current === client) stompRef.current = null;
    };
  }, [contract?.id]);

  const handleCreateDraft = async () => {
    if (!room?.id || creating) return;
    setCreating(true);
    setError(null);
    try {
      await contractApi.generateAiDraft(room.id);
      const c = await contractApi.getContractByRoom(room.id);
      setContract(c);
    } catch (e) {
      try {
        const c = await contractApi.getContractByRoom(room.id);
        setContract(c);
      } catch {
        setError(e instanceof Error ? e.message : 'Tạo hợp đồng thất bại.');
      }
    } finally {
      setCreating(false);
    }
  };

  // Gửi các field đang dở tay (dirty) lên BE. Trả về true nếu đã publish.
  const tryPublishDirty = (): boolean => {
    const client = stompRef.current;
    if (!client?.active || !contract?.id || !myId) {
      setError('Mất kết nối realtime, thử lại sau giây lát.');
      return false;
    }
    const d = dirtyRef.current;
    if (!d.amount && !d.terms) return true;
    const body: { senderId: string; agreedAmount?: number; termsAndConditions?: string } = {
      senderId: myId,
    };
    if (d.amount) {
      const amount = Number(editAmount.replaceAll('.', '').replaceAll(',', '').trim());
      if (!Number.isFinite(amount) || amount <= 0) {
        setError('Giá thỏa thuận phải là số lớn hơn 0.');
        return false;
      }
      body.agreedAmount = amount;
    }
    if (d.terms) {
      if (!editTerms.trim()) {
        setError('Điều khoản không được để trống.');
        return false;
      }
      body.termsAndConditions = editTerms.trim();
    }
    setError(null);
    client.publish({
      destination: `/app/contracts/${contract.id}/sync`,
      body: JSON.stringify(body),
    });
    dirtyRef.current = { amount: false, terms: false };
    pendingRef.current = true;
    setSaveState('saving');
    return true;
  };

  // Tự lưu liên tục: ngừng gõ ~1s là đẩy field vừa sửa sang bên kia ngay
  useEffect(() => {
    if (!isEditing || !contract?.id) return;
    if (!dirtyRef.current.amount && !dirtyRef.current.terms) return;
    const t = setTimeout(() => {
      tryPublishDirty();
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editAmount, editTerms, isEditing, contract?.id]);

  const handleSign = (agreed: boolean) => {
    const client = stompRef.current;
    if (!client?.active || !contract?.id || !myId) {
      setError('Mất kết nối realtime, thử lại sau giây lát.');
      return;
    }
    setError(null);
    client.publish({
      destination: `/app/contracts/${contract.id}/sign`,
      body: JSON.stringify({ senderId: myId, isAgreed: agreed }),
    });
    // Lưới an toàn: 2.5s sau tải lại từ BE phòng rớt broadcast
    const rid = room?.id;
    setTimeout(() => {
      if (!rid) return;
      contractApi
        .getContractByRoom(rid)
        .then((c) => setContract(c))
        .catch(() => {});
    }, 2500);
    // Mình là người ký thứ 2 (bên kia đã ký) → ra phòng chat đợi AI thẩm định
    if (agreed && otherAgreed && room?.id) {
      navigate(`/workspace/${room.id}`, { state: { awaitingReview: true } });
    }
  };

  // Bấm "Giữ nguyên bản này" sau khi AI báo lệch (chỉ khi NEEDS_CONFIRM)
  const handleConfirmKeep = (agreed: boolean) => {
    const client = stompRef.current;
    if (!client?.active || !contract?.id || !myId) {
      setError('Mất kết nối realtime, thử lại sau giây lát.');
      return;
    }
    setError(null);
    client.publish({
      destination: `/app/contracts/${contract.id}/confirm`,
      body: JSON.stringify({ senderId: myId, isAgreed: agreed }),
    });
    // Lưới an toàn: 2.5s sau tải lại từ BE phòng rớt broadcast
    const crid = room?.id;
    setTimeout(() => {
      if (!crid) return;
      contractApi
        .getContractByRoom(crid)
        .then((c) => setContract(c))
        .catch(() => {});
    }, 2500);
    // Mình là người chốt đôi (bên kia đã giữ nguyên) → ra phòng chat đợi kết quả
    if (agreed && otherKeep && room?.id) {
      navigate(`/workspace/${room.id}`, { state: { awaitingReview: true } });
    }
  };

  const startEditing = () => {
    if (!contract) return;
    setEditAmount(String(contract.agreedAmount ?? ''));
    setEditTerms(contract.termsAndConditions ?? '');
    dirtyRef.current = { amount: false, terms: false };
    pendingRef.current = false;
    setError(null);
    setSaveState('idle');
    setSavedAt(null);
    isEditingRef.current = true;
    setIsEditing(true);
  };

  const finishEditing = async () => {
    // Flush lần cuối những gì còn dở rồi mới thoát
    if ((dirtyRef.current.amount || dirtyRef.current.terms) && !tryPublishDirty()) {
      return;
    }
    dirtyRef.current = { amount: false, terms: false };
    isEditingRef.current = false;
    setIsEditing(false);
    // Tải lại từ BE để chắc chắn thoát đúng trạng thái (phòng WS rớt broadcast)
    await reloadContract();
    if (room?.id) void loadRevisions(room.id);
  };

  // Tải lại hợp đồng từ BE (lưới an toàn khi rớt tin realtime)
  const reloadContract = async () => {
    if (!room?.id) return;
    try {
      const c = await contractApi.getContractByRoom(room.id);
      setContract(c);
    } catch {
      // giữ nguyên state cũ
    }
  };

  const onAmountChange = (v: string) => {
    setEditAmount(v);
    dirtyRef.current.amount = true;
    setSaveState('typing');
  };

  const onTermsChange = (v: string) => {
    setEditTerms(v);
    dirtyRef.current.terms = true;
    setSaveState('typing');
  };

  // Tải lịch sử sửa của phòng (mở tab là có, không cần chờ)
  const loadRevisions = async (roomId: string) => {
    try {
      const list = await contractApi.getRevisions(roomId);
      setRevisions(list);
      setSelectedRevId((prev) => prev ?? list[0]?.id ?? null);
    } catch {
      // chưa có hoặc lỗi thì thôi, tab lịch sử sẽ báo trống
    }
  };

  useEffect(() => {
    if (room?.id) void loadRevisions(room.id);
  }, [room?.id]);

  // Bản đang chọn để so sánh với hiện tại + diff đã tính sẵn
  const selectedRev = useMemo(
    () => revisions.find((r) => r.id === selectedRevId) ?? null,
    [revisions, selectedRevId]
  );
  const compareDiff = useMemo(() => {
    if (!selectedRev || !contract) return null;
    const baseTerms = selectedRev.termsAndConditions || '';
    // So sánh với bản xem hiện tại (lúc sửa thì so với nháp đang gõ)
    const currentTerms = isEditing ? editTerms : contract.termsAndConditions || '';
    return {
      amountChanged: Number(selectedRev.agreedAmount) !== Number(contract.agreedAmount),
      oldAmount: selectedRev.agreedAmount,
      rows: diffLines(baseTerms, currentTerms),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRev?.id, contract?.termsAndConditions, contract?.agreedAmount, isEditing, editTerms]);

  // Thanh công cụ markdown cho ô soạn thảo
  const wrapSelection = (before: string, after = '') => {
    const ta = termsRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? editTerms.length;
    const end = ta.selectionEnd ?? editTerms.length;
    const selected = editTerms.slice(start, end) || 'chữ';
    const next = editTerms.slice(0, start) + before + selected + after + editTerms.slice(end);
    onTermsChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + before.length + selected.length + after.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const prefixLines = (prefix: string) => {
    const ta = termsRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const lineStart = editTerms.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = editTerms.indexOf('\n', start);
    const end = lineEnd === -1 ? editTerms.length : lineEnd;
    const line = editTerms.slice(lineStart, end);
    const next = `${editTerms.slice(0, lineStart)}${prefix}${line.replace(/^#+\s*/, '')}${editTerms.slice(end)}`;
    onTermsChange(next);
    requestAnimationFrame(() => ta.focus());
  };

  const myAgreed = role === 'client' ? contract?.clientAgreed : contract?.freelancerAgreed;
  const otherAgreed = role === 'client' ? contract?.freelancerAgreed : contract?.clientAgreed;
  const myKeep =
    role === 'client' ? contract?.clientKeepConfirmed : contract?.freelancerKeepConfirmed;
  const otherKeep =
    role === 'client' ? contract?.freelancerKeepConfirmed : contract?.clientKeepConfirmed;
  const needsConfirm = contract?.status === 'DRAFT' && contract?.reviewStatus === 'NEEDS_CONFIRM';

  const statusBadge = () => {
    if (!contract) return null;
    if (contract.status === 'ACTIVE')
      return (
        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
          ✓ Đã ký — có hiệu lực
        </span>
      );
    if (contract.clientAgreed && contract.freelancerAgreed)
      return (
        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
          ✓ Cả 2 đã ký
        </span>
      );
    if (contract.clientAgreed || contract.freelancerAgreed)
      return (
        <span className="px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
          ⏳ Chờ chữ ký còn lại
        </span>
      );
    if (contract.reviewStatus === 'NEEDS_CONFIRM' && contract.status === 'DRAFT')
      return (
        <span className="px-4 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
          🔍 AI yêu cầu xác nhận lại
        </span>
      );
    return (
      <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
        📝 Nháp — đang thương lượng
      </span>
    );
  };

  const renderConfirmPanel = () => (
    <div className="bg-red-50/60 rounded-[24px] p-5 border border-red-200 shadow-sm flex flex-col gap-3 animate-rise">
      <p className="text-sm font-bold text-red-700">
        🤖 AI thẩm định: hợp đồng có điểm cần xác nhận lại
      </p>
      {contract?.reviewNote && (
        <p className="text-xs text-gray-700 leading-relaxed bg-white rounded-xl p-4 border border-red-100 whitespace-pre-wrap">
          {contract.reviewNote}
        </p>
      )}
      <div className="flex items-center gap-2 text-[11px] font-bold">
        <span
          className={`px-2.5 py-1 rounded-full border ${
            myKeep
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}
        >
          Bạn: {myKeep ? '✓ đã giữ nguyên' : '○ chưa xác nhận'}
        </span>
        <span
          className={`px-2.5 py-1 rounded-full border ${
            otherKeep
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}
        >
          Đối phương: {otherKeep ? '✓ đã giữ nguyên' : '○ chưa xác nhận'}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={startEditing}
          className="flex-1 py-3 rounded-xl bg-white border-2 border-[#1D4ED8] text-[#1D4ED8] font-bold text-sm hover:bg-blue-50 transition-colors cursor-pointer"
        >
          ✏️ Sửa lại rồi ký tiếp
        </button>
        <button
          type="button"
          onClick={() => room && navigate(`/workspace/${room.id}`)}
          className="flex-1 py-3 rounded-xl bg-white border-2 border-violet-300 text-violet-700 font-bold text-sm hover:bg-violet-50 transition-colors cursor-pointer"
        >
          💬 Sang phòng chat đọc AI nhắn
        </button>
        {!myKeep ? (
          <button
            type="button"
            onClick={() => handleConfirmKeep(true)}
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-md hover:bg-emerald-600 transition-colors cursor-pointer border-0"
          >
            👍 Giữ nguyên bản này
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleConfirmKeep(false)}
            className="flex-1 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {otherKeep ? 'Đã giữ nguyên ✓ (chờ chốt)' : 'Đã giữ nguyên ✓ — Hủy xác nhận'}
          </button>
        )}
      </div>
      <p className="text-[11px] text-gray-500 text-center">
        Cả 2 cùng giữ nguyên thì chốt theo đúng số tiền trong hợp đồng. Không thì sửa lại, ký lại,
        AI thẩm định tiếp.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {role === 'client' ? <ClientDashboardHeader /> : <Header />}

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate(room ? `/workspace/${room.id}` : '/workspaces')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors cursor-pointer bg-transparent border-0 mb-6"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Về phòng chat
        </button>

        {loading ? (
          <p className="text-sm text-gray-500 text-center py-20">Đang tải hợp đồng...</p>
        ) : roomError || !room ? (
          <div className="text-center py-20">
            <p className="text-sm text-red-600 font-semibold mb-4">
              {roomError || 'Không tìm thấy phòng chat.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/workspaces')}
              className="text-sm font-bold text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
            >
              Về danh sách tin nhắn
            </button>
          </div>
        ) : !contract ? (
          <div className="bg-white rounded-[28px] p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#1D4ED8] to-[#0AAAD7] text-white flex items-center justify-center text-3xl mb-5">
              📄
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Chưa có hợp đồng</h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto mb-6">
              Dự án <span className="font-bold text-gray-800">{room.jobTitle}</span> chưa có hợp
              đồng.
              {role === 'client'
                ? ' Bấm nút dưới để AI tự soạn nháp từ mô tả dự án và ngân sách: giá đề xuất và điều khoản mẫu — sau đó 2 bên cùng sửa và ký.'
                : ' Chờ phía client bấm tạo hợp đồng bằng AI — bạn sẽ thấy ngay tại đây khi có.'}
            </p>
            {error && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4 max-w-md mx-auto">
                {error}
              </p>
            )}
            {role === 'client' ? (
              <button
                type="button"
                onClick={handleCreateDraft}
                disabled={creating}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity cursor-pointer border-0 disabled:opacity-60"
              >
                {creating ? 'AI đang soạn nháp...' : '✨ Tạo hợp đồng bằng AI'}
              </button>
            ) : (
              <p className="text-xs font-bold text-gray-400">⏳ Đang chờ client tạo hợp đồng...</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Tiêu đề văn bản */}
            <div className="text-center">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">
                Cộng hòa xã hội chủ nghĩa Việt Nam
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
                Hợp đồng dịch vụ Freelance
              </h1>
              <div className="flex items-center justify-center gap-3">
                {statusBadge()}
                <span className="text-xs font-semibold text-gray-400">
                  Dự án: {contract.jobTitle}
                </span>
              </div>
              {/* Tab Văn bản / Lịch sử */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setDocTab('doc')}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer border-0 ${
                    docTab === 'doc'
                      ? 'bg-[#1D4ED8] text-white shadow-md'
                      : 'bg-white text-gray-500 border border-gray-200'
                  }`}
                >
                  📄 Văn bản
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDocTab('history');
                    if (room?.id) void loadRevisions(room.id);
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer border-0 ${
                    docTab === 'history'
                      ? 'bg-[#1D4ED8] text-white shadow-md'
                      : 'bg-white text-gray-500 border border-gray-200'
                  }`}
                >
                  🕘 Lịch sử thay đổi{revisions.length > 0 ? ` (${revisions.length})` : ''}
                </button>
              </div>
            </div>

            {docTab === 'history' ? (
              <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-4 mb-5 text-[11px] font-bold text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-200 border border-blue-300" /> Client
                    sửa
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-violet-200 border border-violet-300" />{' '}
                    Freelancer sửa
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-red-50 border border-red-200" /> Chữ bị xóa
                  </span>
                  <button
                    type="button"
                    onClick={() => room?.id && void loadRevisions(room.id)}
                    className="ml-auto text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Tải lại
                  </button>
                </div>

                {revisions.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Chưa có lịch sử sửa — mới chỉ có bản AI soạn.
                  </p>
                ) : (
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {revisions.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedRevId(r.id)}
                          className={`shrink-0 px-4 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                            selectedRevId === r.id
                              ? 'border-[#1D4ED8] bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                r.editorSide === 'CLIENT' ? 'bg-blue-500' : 'bg-violet-500'
                              }`}
                            />
                            {r.editorName}
                          </span>
                          <span className="block text-[11px] text-gray-400 mt-0.5">
                            {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : ''}
                          </span>
                        </button>
                      ))}
                    </div>

                    {selectedRev && compareDiff && (
                      <div>
                        {compareDiff.amountChanged && (
                          <p className="text-xs font-bold mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                            💰 Giá đổi: {formatMoney(Number(compareDiff.oldAmount))} đ →{' '}
                            {formatMoney(Number(contract.agreedAmount))} đ
                          </p>
                        )}
                        <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-5 text-[13px] leading-7 text-gray-700">
                          {compareDiff.rows.every((row) => row.every((t) => t.type === 'same')) ? (
                            <p className="text-gray-400 text-center py-4">
                              Bản này trùng khớp với hiện tại — không có chữ nào khác.
                            </p>
                          ) : (
                            compareDiff.rows.map((row, ri) => (
                              <p key={ri} className="mb-0.5">
                                {row.map((t, ti) => {
                                  if (t.type === 'same') return <span key={ti}>{t.text}</span>;
                                  if (t.type === 'del')
                                    return (
                                      <span
                                        key={ti}
                                        className="bg-red-50 text-red-400 line-through rounded px-0.5"
                                      >
                                        {t.text}
                                      </span>
                                    );
                                  return (
                                    <span
                                      key={ti}
                                      className={`rounded px-0.5 font-semibold ${
                                        selectedRev.editorSide === 'CLIENT'
                                          ? 'bg-blue-200 text-blue-900'
                                          : 'bg-violet-200 text-violet-900'
                                      }`}
                                    >
                                      {t.text}
                                    </span>
                                  );
                                })}
                              </p>
                            ))
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2 text-center">
                          Đang so bản của {selectedRev.editorName} với hiện tại — chữ thêm mới tô
                          màu theo người sửa.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Tờ hợp đồng */}
                <article className="bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] overflow-hidden">
                  {/* Điều 1: Các bên */}
                  <section className="p-6 md:p-8 border-b border-gray-100">
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
                      Điều 1 — Các bên tham gia
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          Bên A — Khách hàng
                        </p>
                        <p className="text-base font-bold text-gray-900 mb-2">
                          {contract.clientName}
                        </p>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border w-fit ${
                            contract.clientAgreed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          {contract.clientAgreed ? '✓ Đã ký' : '○ Chưa ký'}
                        </span>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          Bên B — Freelancer
                        </p>
                        <p className="text-base font-bold text-gray-900 mb-2">
                          {contract.freelancerName}
                        </p>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border w-fit ${
                            contract.freelancerAgreed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          {contract.freelancerAgreed ? '✓ Đã ký' : '○ Chưa ký'}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Điều 2: Giá trị */}
                  <section className="p-6 md:p-8 border-b border-gray-100">
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
                      Điều 2 — Giá trị hợp đồng
                    </h2>
                    <div className="rounded-2xl p-5 bg-gradient-to-br from-[#1D4ED8] to-[#0AAAD7] text-white">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">
                        Giá thỏa thuận
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editAmount}
                          onChange={(e) => onAmountChange(e.target.value)}
                          placeholder="VD: 15000000"
                          className="w-full bg-white/15 border border-white/30 rounded-lg px-3 py-2 text-lg font-black text-white placeholder:text-white/50 outline-none focus:bg-white/20"
                        />
                      ) : (
                        <p className="text-2xl font-black">
                          {formatMoney(Number(contract.agreedAmount))} đ
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Điều 3: Điều khoản — sửa thì chia đôi: trái gõ + toolbar, phải xem đẹp live */}
                  <section className="p-6 md:p-8">
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
                      Điều 3 — Điều khoản chi tiết
                    </h2>
                    {isEditing ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2 bg-[#F8FAFC] border border-gray-100 rounded-xl px-3 py-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">
                            Định dạng:
                          </span>
                          {[
                            {
                              label: 'B',
                              title: 'In đậm',
                              onClick: () => wrapSelection('**', '**'),
                            },
                            {
                              label: 'H2',
                              title: 'Tiêu đề điều',
                              onClick: () => prefixLines('## '),
                            },
                            {
                              label: 'H3',
                              title: 'Tiêu đề mục',
                              onClick: () => prefixLines('### '),
                            },
                            {
                              label: '• Danh sách',
                              title: 'Gạch đầu dòng',
                              onClick: () => prefixLines('- '),
                            },
                            {
                              label: '1. Danh sách',
                              title: 'Danh sách số',
                              onClick: () => prefixLines('1. '),
                            },
                            {
                              label: '―――',
                              title: 'Đường kẻ ngang',
                              onClick: () => wrapSelection('\n---\n'),
                            },
                          ].map((b) => (
                            <button
                              key={b.label}
                              type="button"
                              title={b.title}
                              onClick={b.onClick}
                              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors cursor-pointer"
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          <textarea
                            ref={termsRef}
                            value={editTerms}
                            onChange={(e) => onTermsChange(e.target.value)}
                            rows={18}
                            placeholder="Gõ nội dung... dùng nút định dạng ở trên để in đậm, tiêu đề, danh sách"
                            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-2xl p-5 font-mono text-[13px] text-gray-800 leading-relaxed outline-none focus:border-[#1D4ED8] resize-y min-h-[320px]"
                          />
                          <div className="bg-[#F8FAFC] border border-blue-100 rounded-2xl p-6 overflow-y-auto max-h-[520px]">
                            <p className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-widest mb-3">
                              👁 Xem trước (bên kia cũng thấy y hệt)
                            </p>
                            <ContractMarkdown content={editTerms} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6">
                        <ContractMarkdown content={contract.termsAndConditions} />
                      </div>
                    )}
                  </section>

                  {/* Ký tên */}
                  <section className="px-6 md:px-8 pb-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center border-t-2 border-gray-900 pt-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          Bên A
                        </p>
                        <p className="text-sm font-bold text-gray-900">{contract.clientName}</p>
                        <p className="text-lg mt-1">{contract.clientAgreed ? '✅' : '⬜'}</p>
                      </div>
                      <div className="text-center border-t-2 border-gray-900 pt-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          Bên B
                        </p>
                        <p className="text-sm font-bold text-gray-900">{contract.freelancerName}</p>
                        <p className="text-lg mt-1">{contract.freelancerAgreed ? '✅' : '⬜'}</p>
                      </div>
                    </div>
                  </section>
                </article>

                {/* Nạp tiền khởi động khi hợp đồng đã ký (client 100% + freelancer cọc 2%) */}
                {contract.status === 'ACTIVE' && room && (
                  <>
                    {fundingNotice && (
                      <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                        {fundingNotice}
                      </p>
                    )}
                    <FundingPanel roomId={room.id} contractId={contract.id} />
                  </>
                )}

                {error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                {/* Thanh hành động */}
                {contract.status === 'ACTIVE' ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-[24px] p-6 text-center">
                    <p className="text-base font-bold text-emerald-700">
                      🎉 Hợp đồng đã có hiệu lực! Hai bên bắt đầu làm việc.
                    </p>
                    <p className="text-xs text-emerald-600/80 mt-1">
                      Bước tiếp theo: 2 bên nạp tiền khởi động ở mục bên dưới.
                    </p>
                  </div>
                ) : isEditing ? (
                  <div className="bg-white rounded-[24px] p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <p className="text-xs font-bold text-gray-500">
                        {saveState === 'typing' && '● Đang nhập...'}
                        {saveState === 'saving' && '↻ Đang lưu...'}
                        {saveState === 'saved' &&
                          `✓ Đã lưu tự động${savedAt ? ` lúc ${savedAt}` : ''} — bên kia thấy ngay`}
                        {saveState === 'idle' && 'Mọi thay đổi tự lưu sau ~1s'}
                      </p>
                      <button
                        type="button"
                        onClick={finishEditing}
                        className="px-6 py-2.5 rounded-xl bg-[#1D4ED8] text-white font-bold text-sm shadow-md hover:bg-[#153bb5] transition-colors cursor-pointer border-0"
                      >
                        Xong
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-600 font-semibold">
                      ⚠️ Mỗi lần lưu sẽ reset chữ ký của cả 2 bên về chưa ký. Hai bên cứ sửa thoải
                      mái, không ai bị đá ra ngoài.
                    </p>
                  </div>
                ) : needsConfirm ? (
                  renderConfirmPanel()
                ) : (
                  <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 sticky bottom-4">
                    <button
                      type="button"
                      onClick={startEditing}
                      className="flex-1 py-3 rounded-xl bg-white border-2 border-[#1D4ED8] text-[#1D4ED8] font-bold text-sm hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      ✏️ Cùng sửa hợp đồng
                    </button>
                    {!myAgreed ? (
                      <button
                        type="button"
                        onClick={() => handleSign(true)}
                        className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-md hover:bg-emerald-600 transition-colors cursor-pointer border-0"
                      >
                        ✍️ Ký hợp đồng
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSign(false)}
                        className="flex-1 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {otherAgreed ? 'Đã ký ✓ (chờ hiệu lực)' : 'Đã ký ✓ — Hủy chữ ký / Sửa lại'}
                      </button>
                    )}
                  </div>
                )}
                {!myAgreed && !isEditing && !needsConfirm && contract.status === 'DRAFT' && (
                  <p className="text-xs text-gray-400 text-center">
                    {otherAgreed
                      ? 'Đối phương đã ký — tới lượt bạn ký để hợp đồng có hiệu lực.'
                      : 'Khi cả 2 cùng ký, hợp đồng tự có hiệu lực ngay.'}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ContractPage;
