import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import { jobApi } from '../api/job';
import { proposalApi } from '../api/proposal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useInviteNotifications } from '../hooks/useInviteNotifications';
import { extractApiResponse } from '../lib/api-error';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

const normalizeSrsNewlines = (content: string | null | undefined): string => {
  if (!content) return '';
  return content
    .replaceAll('\\\\n', '\n')
    .replaceAll('\\n', '\n')
    .replaceAll('\\r', '\n')
    .replaceAll('\r\n', '\n');
};

function formatBudget(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Thỏa thuận';
  const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) {
    if (min === max) return fmt(min);
    return `${fmt(min)} - ${fmt(max)}`;
  }
  if (min) return `Từ ${fmt(min)}`;
  return `Đến ${fmt(max!)}`;
}

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const {
    data: job,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJobById(id!),
    enabled: !!id,
  });

  const { user } = useAuthStore();
  const isFreelancer = user?.role === 'FREELANCER';

  const { data: myRec, refetch: refetchMyRec } = useQuery({
    queryKey: ['my-recommendation', id],
    queryFn: () => jobApi.getMyRecommendation(id!),
    enabled: !!id && isFreelancer,
    retry: false, // Don't retry if 404
  });

  // Hồ sơ phổ thông của tôi cho job này (để thấy lời mời hợp tác của client)
  const { data: myProposal, refetch: refetchMyProposal } = useQuery({
    queryKey: ['my-proposal', id],
    queryFn: () => proposalApi.getMineForJob(id!),
    enabled: !!id && isFreelancer,
    retry: false, // Don't retry if 404 (chưa nộp)
  });

  // Realtime: client vừa bấm "Mời làm việc" -> tự refetch + hiện banner mà không cần F5
  const { latest } = useInviteNotifications((n) => {
    if (n.jobId === id) {
      void refetchMyRec();
      void refetchMyProposal();
    }
  });
  const showInviteBanner =
    !!latest &&
    latest.jobId === id &&
    (latest.type === '1_TOUCH_INVITE' ||
      latest.type === 'CHAT_OPENED' ||
      latest.type === 'PROPOSAL_INVITE');

  const savedApplications = JSON.parse(localStorage.getItem('SAM_FREELANCER_APPLICATIONS') || '[]');
  const existingApplication = job
    ? savedApplications.find((app: { jobId: string; status: string }) => app.jobId === job.id)
    : null;

  const getButtonText = () => {
    if (!existingApplication || existingApplication.status === 'cancelled') return 'Ứng tuyển';
    switch (existingApplication.status) {
      case 'pending':
        return 'Đang chờ phản hồi';
      case 'draft':
        return 'Ứng tuyển';
      case 'approved':
        return 'Đã được duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return 'Ứng tuyển';
    }
  };

  const getButtonClass = () => {
    const baseClass = 'font-medium px-6 h-[44px] rounded-lg transition-all text-sm border-0 ';
    if (!existingApplication || ['draft', 'cancelled'].includes(existingApplication.status)) {
      return `${baseClass}bg-[#1D4ED8] hover:bg-[#1e40af] text-white cursor-pointer btn-sweep border-t border-t-blue-400/30 active:scale-[0.97] shadow-xs`;
    }
    return `${baseClass}bg-slate-100 text-slate-400 cursor-not-allowed`;
  };

  const handleApplyClick = () => {
    if (!job) return;
    if (
      !existingApplication ||
      existingApplication.status === 'draft' ||
      existingApplication.status === 'cancelled'
    ) {
      navigate(paths.PATH_JOB_APPLY.replace(':id', job.id));
    }
  };

  const handleCancelApplication = () => {
    if (!job) return;
    const updated = savedApplications.map((app: { jobId: string; status: string }) => {
      if (app.jobId === job.id) return { ...app, status: 'cancelled' };
      return app;
    });
    localStorage.setItem('SAM_FREELANCER_APPLICATIONS', JSON.stringify(updated));
    setIsCancelModalOpen(false);
    window.location.reload();
  };

  const handleClaim = async () => {
    if (!job || !myRec) return;
    try {
      await jobApi.claimJob(job.id, myRec.id);
      void refetchMyRec();
    } catch (e) {
      console.error(e);
      alert('Yêu cầu thất bại');
    }
  };

  const handleAcceptInvite = async () => {
    if (!job || !myRec) return;
    try {
      const res = await jobApi.acceptInvitation(job.id, myRec.id);
      if (res?.roomId) {
        navigate(paths.PATH_WORKSPACE.replace(':projectId', res.roomId));
        return;
      }
      void refetchMyRec();
    } catch (e) {
      console.error(e);
      alert('Chấp nhận thất bại');
    }
  };

  const handleRejectInvite = async () => {
    if (!job || !myRec) return;
    try {
      await jobApi.rejectInvitation(job.id, myRec.id);
      void refetchMyRec();
    } catch (e) {
      console.error(e);
      alert('Từ chối thất bại');
    }
  };

  const handleAcceptProposalInvite = async () => {
    if (!job || !myProposal) return;
    try {
      const res = await proposalApi.accept(myProposal.id);
      if (res?.roomId) {
        navigate(paths.PATH_WORKSPACE.replace(':projectId', res.roomId));
        return;
      }
      void refetchMyProposal();
    } catch (e) {
      console.error(e);
      alert('Chấp nhận thất bại');
    }
  };

  const handleRejectProposalInvite = async () => {
    if (!job || !myProposal) return;
    try {
      await proposalApi.reject(myProposal.id);
      void refetchMyProposal();
    } catch (e) {
      console.error(e);
      alert('Từ chối thất bại');
    }
  };

  // ── Loading / Error states ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-64 bg-gray-200 rounded-3xl" />
            <div className="h-40 bg-gray-200 rounded-3xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !job) {
    const serverMessage = extractApiResponse(error)?.message;
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy dự án</h2>
            <p className="text-gray-500 mb-6">
              {serverMessage || 'Dự án không tồn tại hoặc đã bị xóa.'}
            </p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors border-0 cursor-pointer"
            >
              Quay lại
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1D4ED8] mb-6 font-semibold transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>

        {showInviteBanner && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <span className="text-2xl">🔥</span>
            <div className="flex-1">
              <p className="font-bold text-sm">
                {latest?.type === 'CHAT_OPENED'
                  ? 'Phòng chat đã mở! Vào thương lượng ngay.'
                  : 'Bạn vừa nhận được lời mời tuyển gấp cho dự án này!'}
              </p>
              <p className="text-xs text-white/80">
                {latest?.jobTitle || latest?.message || 'Kéo xuống để chấp nhận lời mời.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          {/* ================= CỘT TRÁI ================= */}
          <div className="flex flex-col gap-8">
            <section className="bg-white rounded-xl p-8 border border-slate-200/90 shadow-xs">
              {/* Status + Urgent badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`text-xs font-mono font-medium px-2.5 py-1 rounded-md ${
                    job.status === 'OPEN'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : job.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        : job.status === 'AWAITING_PAYMENT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {job.status === 'OPEN'
                    ? '🟢 Đang mở'
                    : job.status === 'IN_PROGRESS'
                      ? '🔵 Đang thực hiện'
                      : job.status === 'AWAITING_PAYMENT'
                        ? '🟡 Chờ nạp tiền'
                        : job.status}
                </span>
                {job.isUrgentHiring && (
                  <span className="text-xs font-mono font-medium text-white bg-red-500 px-2.5 py-1 rounded-md">
                    🔥 Tuyển gấp
                  </span>
                )}
                {job.isFeatured && (
                  <span className="text-xs font-mono font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-md">
                    ⭐ Nổi bật
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug mb-4 tracking-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-8">
                {job.skills?.map((skill) => (
                  <span
                    key={skill.id}
                    className="text-xs font-mono font-medium text-[#1D4ED8] bg-blue-50/70 border border-blue-100 px-2.5 py-1 rounded-md"
                  >
                    {skill.name}
                    {skill.yearsOfExperience ? ` (${skill.yearsOfExperience}+năm)` : ''}
                  </span>
                ))}
              </div>

              <h2 className="text-base font-bold text-slate-900 mb-2">Mô tả dự án</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {job.description || 'Đang cập nhật mô tả...'}
              </p>

              {/* Tài liệu SRS nếu có */}
              {job.srsContent && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Tài liệu đặc tả (SRS)</h2>
                    {job.srsDocumentUrl && (
                      <a
                        href={job.srsDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#1D4ED8] hover:underline ml-auto flex items-center gap-1"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Mở file gốc
                      </a>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none bg-[#F8FAFC] border border-gray-100 rounded-xl p-6 text-gray-700">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-lg font-bold text-gray-900 mt-4 mb-2 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-base font-bold text-gray-800 mt-3 mb-2">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-semibold text-gray-700 mt-2 mb-1.5">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-xs leading-5 text-gray-700 mb-2">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 mb-2 ml-2">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside text-xs text-gray-700 space-y-1 mb-2 ml-2">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => <li className="text-xs leading-5">{children}</li>,
                        strong: ({ children }) => (
                          <strong className="font-bold text-gray-900">{children}</strong>
                        ),
                      }}
                    >
                      {normalizeSrsNewlines(job.srsContent)}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mt-10">
                {isFreelancer && myProposal && myProposal.status === 'INVITED' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleAcceptProposalInvite}
                      className="font-bold px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 hover:shadow-lg text-white cursor-pointer transition-shadow text-sm border-0"
                    >
                      🤝 Đồng ý hợp tác (Mở Chat)
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectProposalInvite}
                      className="font-bold px-6 py-3 rounded-full bg-white text-red-500 border-2 border-red-500 hover:bg-red-50 cursor-pointer text-sm"
                    >
                      Từ chối
                    </button>
                  </>
                ) : isFreelancer && myProposal && myProposal.status === 'PENDING' ? (
                  <button
                    type="button"
                    disabled
                    className="font-bold px-6 py-3 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed text-sm border-0"
                  >
                    ⏳ Đã nộp hồ sơ — chờ client duyệt
                  </button>
                ) : isFreelancer && myProposal && myProposal.status === 'ACCEPTED' ? (
                  <button
                    type="button"
                    onClick={() => navigate(paths.PATH_WORKSPACES)}
                    className="font-bold px-6 py-3 rounded-full bg-[#1D4ED8] hover:bg-[#153bb5] text-white cursor-pointer text-sm border-0"
                  >
                    💬 Đã nhận việc - Vào tin nhắn
                  </button>
                ) : isFreelancer && myProposal && myProposal.status === 'REJECTED' ? (
                  <button
                    type="button"
                    disabled
                    className="font-bold px-6 py-3 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed text-sm border-0"
                  >
                    🚫 Hồ sơ bị từ chối
                  </button>
                ) : isFreelancer && job.status !== 'OPEN' ? (
                  <button
                    type="button"
                    disabled
                    className="font-bold px-6 py-3 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed text-sm border-0"
                  >
                    🔒 Đã đóng tuyển
                  </button>
                ) : isFreelancer && myRec ? (
                  <>
                    {myRec.status === 'AUTO_MATCHED' && (
                      <button
                        type="button"
                        onClick={handleClaim}
                        className="font-bold px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white cursor-pointer transition-shadow text-sm border-0"
                      >
                        ⚡ Claim ngay (Yêu cầu Chat)
                      </button>
                    )}
                    {myRec.status === 'DEV_REQUESTED' && (
                      <button
                        type="button"
                        disabled
                        className="font-bold px-6 py-3 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed text-sm border-0"
                      >
                        ⏳ Đang chờ Client phản hồi
                      </button>
                    )}
                    {myRec.status === 'CLIENT_REQUESTED' && (
                      <>
                        <button
                          type="button"
                          onClick={handleAcceptInvite}
                          className="font-bold px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 hover:shadow-lg text-white cursor-pointer transition-shadow text-sm border-0"
                        >
                          Đồng ý Mời Chat
                        </button>
                        <button
                          type="button"
                          onClick={handleRejectInvite}
                          className="font-bold px-6 py-3 rounded-full bg-white text-red-500 border-2 border-red-500 hover:bg-red-50 cursor-pointer text-sm"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    {myRec.status === 'ACCEPTED' && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(paths.PATH_WORKSPACE.replace(':projectId', job.id.toString()))
                        }
                        className="font-bold px-6 py-3 rounded-full bg-[#1D4ED8] hover:bg-[#153bb5] text-white cursor-pointer text-sm border-0"
                      >
                        💬 Đã nhận việc - Vào phòng Chat
                      </button>
                    )}
                    {myRec.status === 'REJECTED' && (
                      <button
                        type="button"
                        disabled
                        className="font-bold px-6 py-3 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed text-sm border-0"
                      >
                        🚫 Đã từ chối
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button type="button" onClick={handleApplyClick} className={getButtonClass()}>
                      {getButtonText()}
                    </button>
                    {existingApplication &&
                      !['draft', 'cancelled'].includes(existingApplication.status) && (
                        <button
                          type="button"
                          onClick={() => setIsCancelModalOpen(true)}
                          className="px-6 py-3 rounded-full font-bold bg-white text-red-500 border-2 border-red-500 hover:bg-red-50 transition-colors cursor-pointer text-sm"
                        >
                          Ngưng ứng tuyển
                        </button>
                      )}
                  </>
                )}
              </div>
            </section>

            <section className="bg-white rounded-xl p-8 border border-slate-200/90 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                <span className="w-1.5 h-4 bg-[#1D4ED8] rounded-xs" />
                Yêu cầu chi tiết
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#F8FAFC] p-4 rounded-2xl flex flex-col items-start gap-2 border border-gray-100">
                  <svg
                    className="w-5 h-5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Time"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Thời hạn
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {job.estimatedDurationMonths
                      ? `${job.estimatedDurationMonths} tháng`
                      : 'Thỏa thuận'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-2xl flex flex-col items-start gap-2 border border-gray-100">
                  <svg
                    className="w-5 h-5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Skills"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Kỹ năng
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {job.skills?.map((s) => s.name).join(', ') || 'Chưa xác định'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-2xl flex flex-col items-start gap-2 border border-gray-100">
                  <svg
                    className="w-5 h-5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Level"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Cấp độ
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {job.riskLevel ? `Rủi ro: ${job.riskLevel}` : 'Chưa xác định'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-2xl flex flex-col items-start gap-2 border border-gray-100">
                  <svg
                    className="w-5 h-5 text-[#1D4ED8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Language"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Loại dự án
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {job.requiresAiQa ? 'Có bảo vệ QA' : 'Tiêu chuẩn'}
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl p-8 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-900">Các công việc tương tự</h2>
                <button
                  type="button"
                  className="text-xs font-mono font-medium text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0"
                >
                  XEM TẤT CẢ →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200/90 rounded-lg p-5 hover:border-[#1D4ED8]/60 transition-colors bg-white flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-mono font-bold text-white bg-[#1D4ED8] px-2 py-0.5 rounded">
                      MỚI ĐĂNG
                    </span>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        role="img"
                        aria-label="Bookmark"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                    Kỹ sư Computer Vision cho Hệ thống An ninh
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      OpenCV
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      C++
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-sm font-bold font-mono text-[#1D4ED8]">₫35,000,000</span>
                    <button
                      type="button"
                      className="text-xs font-medium text-[#1D4ED8] bg-blue-50 px-3 py-1.5 rounded-md cursor-pointer border border-blue-100 hover:bg-blue-100/60 transition-colors"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200/90 rounded-lg p-5 hover:border-[#1D4ED8]/60 transition-colors bg-white flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-mono font-bold text-white bg-[#1D4ED8] px-2 py-0.5 rounded">
                      MỚI ĐĂNG
                    </span>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        role="img"
                        aria-label="Bookmark"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                    Chuyên gia AI tạo hình & Stable Diffusion
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Stable Diffusion
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Midjourney
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-sm font-bold font-mono text-[#1D4ED8]">₫30,000,000</span>
                    <button
                      type="button"
                      className="text-xs font-medium text-[#1D4ED8] bg-blue-50 px-3 py-1.5 rounded-md cursor-pointer border border-blue-100 hover:bg-blue-100/60 transition-colors"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="w-full rounded-xl bg-slate-900 border border-slate-800 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="md:w-1/2">
                <span className="font-mono text-[10px] text-blue-400 uppercase tracking-widest block mb-1">
                  {'//'} HỆ SINH THÁI
                </span>
                <h3 className="text-lg font-bold mb-1.5 tracking-tight">Thông tin về SAM</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hệ sinh thái AI Matching hàng đầu Đông Nam Á, kết nối tài năng công nghệ với những
                  dự án tương lai.
                </p>
              </div>
              <div className="md:w-1/2 flex justify-between w-full font-mono">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white">4.8</span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    Sao đánh giá
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white">#1</span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    Nền tảng
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white">2M+</span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    Truy cập
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white">$15M</span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    Đã chi trả
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CỘT PHẢI ================= */}
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex justify-between items-center mb-5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  THÔNG TIN DỰ ÁN
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase ${
                    job.status === 'OPEN'
                      ? 'bg-blue-50 text-[#1D4ED8] border border-blue-100'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {job.status === 'OPEN' ? 'Đang mở' : job.status}
                </span>
              </div>

              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <span className="text-xs font-mono text-slate-500">MÃ DỰ ÁN:</span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {job.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#1D4ED8]">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Wallet"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">
                      Ngân sách
                    </div>
                    <div className="text-lg font-bold font-mono text-[#1D4ED8]">
                      {formatBudget(job.budgetMin, job.budgetMax)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center shrink-0 text-slate-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Payment type"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">
                      Thanh toán
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      Theo cột mốc (Milestones)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center shrink-0 text-slate-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Remote work"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">
                      Hình thức làm việc
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      Làm việc từ xa (Remote)
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-4">
                THÔNG TIN KHÁCH HÀNG
              </span>

              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 text-xs font-mono font-bold">
                  {(job.clientName || 'KH').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {job.clientName || 'Khách hàng'}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 font-mono text-xs">
                    <span className="text-amber-500">★</span>
                    <span className="font-bold text-slate-900">4.9</span>
                    <span className="text-slate-400 text-[11px]">(42)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mb-6 border-t border-slate-100 pt-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Location"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Hồ Chí Minh, Việt Nam</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Join date"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Đã tham gia vào 15/05/2023</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Job count"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>24 công việc đã đăng</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full h-[44px] bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer btn-sweep border-t border-t-blue-400/30 active:scale-[0.97]"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Message"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Liên hệ khách hàng
              </button>
            </section>
          </div>
        </div>
      </main>

      <Footer />

      <ConfirmDeleteModal
        isOpen={isCancelModalOpen}
        title="Xác nhận ngưng ứng tuyển"
        message="Bạn có chắc chắn muốn hủy ứng tuyển dự án này không? Bạn vẫn có thể ứng tuyển lại sau này."
        confirmText="Ngưng ứng tuyển"
        onConfirm={handleCancelApplication}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
};

export default JobDetailPage;
