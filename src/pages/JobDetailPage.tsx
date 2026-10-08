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
    const baseClass = 'font-bold px-6 py-3 rounded-full transition-shadow text-sm border-0 ';
    if (!existingApplication || ['draft', 'cancelled'].includes(existingApplication.status)) {
      return `${baseClass}bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:shadow-lg text-white cursor-pointer`;
    }
    return `${baseClass}bg-gray-200 text-gray-500 cursor-not-allowed`;
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
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              {/* Status + Urgent badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    job.status === 'OPEN'
                      ? 'bg-green-100 text-green-700'
                      : job.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-700'
                        : job.status === 'AWAITING_PAYMENT'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
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
                  <span className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded-full">
                    🔥 Tuyển gấp
                  </span>
                )}
                {job.isFeatured && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                    ⭐ Nổi bật
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-4">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-8">
                {job.skills?.map((skill) => (
                  <span
                    key={skill.id}
                    className="text-xs font-semibold text-[#1D4ED8] bg-[#EEF2FF] px-3 py-1.5 rounded-full"
                  >
                    {skill.name}
                    {skill.yearsOfExperience ? ` (${skill.yearsOfExperience}+năm)` : ''}
                  </span>
                ))}
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-3">Mô tả dự án</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
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
                  <div className="prose prose-sm max-w-none bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6 text-gray-700">
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

            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-[#1D4ED8] rounded-full" />
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

            <div className="w-full rounded-3xl bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="md:w-1/2">
                <h3 className="text-xl font-bold mb-2">Thông tin về SAM</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Hệ sinh thái AI Matching hàng đầu Đông Nam Á, kết nối tài năng công nghệ với những
                  dự án tương lai.
                </p>
              </div>
              <div className="md:w-1/2 flex justify-between w-full">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black">4.8</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
                    Sao đánh giá
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black">#1</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
                    Nền tảng
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black">2M+</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
                    Truy cập
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black">$15M</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
                    Đã chi trả
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CỘT PHẢI ================= */}
          <div className="flex flex-col gap-6">
            <section className="bg-[#EEF2FF] rounded-3xl p-6 border border-[#E0E7FF]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Thông dự án
                </span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase ${
                    job.status === 'OPEN' ? 'bg-[#1D4ED8] text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {job.status === 'OPEN' ? 'Đang mở' : job.status}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  ID: {job.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#1D4ED8]">
                    <svg
                      className="w-5 h-5"
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
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Ngân sách
                    </div>
                    <div className="text-xl font-black text-[#1D4ED8]">
                      {formatBudget(job.budgetMin, job.budgetMax)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-6">
                Thông tin khách hàng
              </span>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">
                    LOGO
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    {job.clientName || 'Khách hàng'}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <svg
                      className="w-3.5 h-3.5 text-[#00B2FF]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label="Star"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="text-xs font-bold text-gray-900">4.9</span>
                    <span className="text-[11px] text-gray-400">(42)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-6 border-t border-gray-100 pt-5">
                <div className="flex items-center gap-3 text-gray-600 text-xs">
                  <svg
                    className="w-4 h-4 shrink-0"
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
                <div className="flex items-center gap-3 text-gray-600 text-xs">
                  <svg
                    className="w-4 h-4 shrink-0"
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
                <div className="flex items-center gap-3 text-gray-600 text-xs">
                  <svg
                    className="w-4 h-4 shrink-0"
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
                className="w-full bg-[#0AAAD7] hover:bg-[#0896BD] text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border-0"
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
