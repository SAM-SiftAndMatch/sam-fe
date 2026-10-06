import axios from 'axios';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import { jobApi } from '../api/job';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Footer from '../components/Footer';
import { PATH_CLIENT_POST_PROJECT, PATH_CLIENT_PROJECTS, PATH_WORKSPACE } from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';
import type { JobResponse, RecommendationResponse } from '../types/job';
import { formatDate, formatMoney } from '../utils/format';

const normalizeSrsNewlines = (content: string | null | undefined): string => {
  if (!content) return '';
  return content
    .replaceAll('\\\\n', '\n')
    .replaceAll('\\n', '\n')
    .replaceAll('\\r', '\n')
    .replaceAll('\r\n', '\n');
};

const ClientProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [project, setProject] = useState<JobResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated || !id) return;
    setIsLoading(true);
    setServerError(null);
    try {
      const job = await jobApi.getJobById(id);
      setProject(job);
      if (job.status === 'OPEN') {
        setRecommendations(await jobApi.getRecommendations(id));
      } else {
        setRecommendations([]);
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { message?: string } | undefined;
        setServerError(data?.message || 'Không tải được chi tiết dự án');
      } else {
        setServerError('Không tải được chi tiết dự án');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCancel = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      await jobApi.cancelJob(id);
      setIsDeleteModalOpen(false);
      navigate(PATH_CLIENT_PROJECTS);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { message?: string } | undefined;
        setServerError(data?.message || 'Hủy dự án thất bại');
      } else {
        setServerError('Hủy dự án thất bại');
      }
      setIsDeleteModalOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleInvite = async (recId: string) => {
    if (!id) return;
    setInvitingId(recId);
    setServerError(null);
    setSuccessMessage(null);
    try {
      await jobApi.inviteCandidate(id, recId);
      setSuccessMessage('Đã gửi lời mời. Freelancer sẽ nhận thông báo realtime.');
      await loadData();
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { message?: string } | undefined;
        setServerError(data?.message || 'Gửi lời mời thất bại');
      } else {
        setServerError('Gửi lời mời thất bại');
      }
    } finally {
      setInvitingId(null);
    }
  };

  const handleEdit = () => {
    if (!project) return;
    navigate(PATH_CLIENT_POST_PROJECT, {
      state: {
        projectId: project.id,
        projectName: project.title,
        category: '',
        description: project.description,
        selectedSkills: project.skills.map((s) => s.name),
        budgetAmount: project.budgetMax,
        upgrades: {
          featured: project.isFeatured,
          urgent: project.isUrgentHiring,
          warranty: project.requiresAiQa,
        },
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Đang chờ đề xuất
          </span>
        );
      case 'NEGOTIATING':
        return (
          <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-bold border border-yellow-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
            Đang thương lượng
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold border border-orange-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
            Đang thực hiện
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Đã hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const getRecStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 w-fit">
            AI đề xuất
          </span>
        );
      case 'INVITED':
        return (
          <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-bold border border-yellow-100 w-fit">
            Đang chờ phản hồi
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 w-fit">
            Đã nhận việc
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200 w-fit">
            Đã từ chối
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <ClientDashboardHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Breadcrumb & Nút quay lại */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(PATH_CLIENT_PROJECTS)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors cursor-pointer bg-transparent border-0"
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
            Quay lại danh sách
          </button>
        </div>

        {serverError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {serverError}
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl">
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500 text-center py-10">Đang tải chi tiết dự án...</p>
        ) : !project ? (
          <p className="text-sm text-gray-500 text-center py-10">Không tìm thấy dự án.</p>
        ) : (
          <>
            {/* Cột chính */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
              {/* Thông tin dự án */}
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(project.status)}
                    <span className="text-xs font-semibold text-gray-400">
                      {formatDate(project.createdAt)}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
                  <div className="flex items-center gap-4 text-sm font-semibold text-gray-500 mb-6">
                    <span>
                      Mã DA:{' '}
                      <span className="text-gray-900">
                        SAM-{project.id.slice(0, 8).toUpperCase()}
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      Ngân sách:{' '}
                      <span className="text-[#1D4ED8]">
                        {project.budgetMin === project.budgetMax
                          ? formatMoney(project.budgetMin)
                          : `${formatMoney(project.budgetMin)} – ${formatMoney(project.budgetMax)}`}
                      </span>
                    </span>
                    {project.estimatedDurationMonths != null && (
                      <>
                        <span>•</span>
                        <span>
                          Thời gian thực hiện:{' '}
                          <span className="text-gray-900">
                            {project.estimatedDurationMonths} tháng
                          </span>
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">
                    Mô tả dự án
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                    {project.description}
                  </p>

                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">
                    Kỹ năng yêu cầu
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-xs font-bold border border-gray-200 flex items-center gap-1.5"
                      >
                        {skill.name}
                        {skill.yearsOfExperience != null && (
                          <span className="text-[10px] text-[#1D4ED8] font-black">
                            {skill.yearsOfExperience} năm
                          </span>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Tài liệu SRS */}
                  {project.srsContent && (
                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                          Tài liệu SRS
                        </h3>
                        {project.srsDocumentUrl && (
                          <a
                            href={project.srsDocumentUrl}
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
                          {normalizeSrsNewlines(project.srsContent)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>

                {/* Danh sách ứng viên AI đề xuất */}
                {project.status === 'OPEN' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        Ứng viên AI đề xuất ({recommendations.length})
                      </h2>
                    </div>

                    <div className="flex flex-col gap-4">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex flex-col md:flex-row gap-6"
                        >
                          {/* Info Freelancer */}
                          <div className="flex flex-col items-center text-center md:w-1/4">
                            <div className="w-16 h-16 rounded-full bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center font-black text-xl mb-3">
                              {rec.fullName.charAt(0)}
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{rec.fullName}</h4>
                            <p className="text-xs text-gray-500 mb-2">{rec.headline}</p>
                            <div className="text-xs font-bold text-[#1D4ED8]">
                              Khớp {rec.matchScore}%
                            </div>
                          </div>

                          {/* Recommendation Details */}
                          <div className="md:w-3/4 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex flex-col gap-1">
                                {getRecStatusBadge(rec.status)}
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                  Kỹ năng
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                  {rec.skills.map((s) => s.skillName).join(', ') || '—'}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                              &ldquo;{rec.aiComment}&rdquo;
                            </p>
                            <div className="mt-auto flex gap-3">
                              {rec.status === 'PENDING' && (
                                <button
                                  onClick={() => void handleInvite(rec.id)}
                                  disabled={invitingId === rec.id}
                                  className="flex-1 py-2.5 rounded-full bg-[#1D4ED8] hover:bg-[#153bb5] text-white font-bold transition-colors cursor-pointer text-sm border-0 shadow-md disabled:opacity-60"
                                >
                                  {invitingId === rec.id ? 'Đang mời...' : 'Mời làm việc'}
                                </button>
                              )}
                              {rec.status === 'INVITED' && (
                                <button
                                  type="button"
                                  disabled
                                  className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-500 font-bold text-sm border-0 cursor-default"
                                >
                                  Đang chờ phản hồi
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {recommendations.length === 0 && (
                        <p className="text-sm text-gray-500">
                          Chưa có đề xuất nào cho dự án này (AI Headhunter chỉ chạy với job Tuyển
                          gấp).
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Trạng thái Đang thực hiện */}
                {project.status === 'IN_PROGRESS' && (
                  <div className="bg-[#EEF2FF] rounded-[24px] p-8 border border-[#E0E7FF] flex flex-col items-center text-center mt-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-[#1D4ED8]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8m-5.226-2a2 2 0 00-1.774-1.5H8m-5.226 2A2 2 0 001 8v10a2 2 0 002 2h14a2 2 0 002-2V8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Dự án đang được thực hiện
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 max-w-md">
                      Freelancer đã được giao việc và đang trong quá trình thực hiện dự án. Mọi trao
                      đổi và giao nhận file sẽ diễn ra tại Phòng làm việc.
                    </p>
                    <button
                      onClick={() =>
                        navigate(PATH_WORKSPACE.replace(':projectId', project.id.toString()))
                      }
                      className="bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-all cursor-pointer border-0"
                    >
                      Vào phòng làm việc (Workspace)
                    </button>
                  </div>
                )}
              </div>

              {/* Cột Sidebar */}
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
                    Gói nâng cấp đã mua
                  </h3>
                  <div className="flex flex-col gap-3">
                    {project.isFeatured && (
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-yellow-700">Dự án Nổi bật</div>
                          <div className="text-xs text-yellow-600">Được ưu tiên hiển thị</div>
                        </div>
                      </div>
                    )}
                    {project.isUrgentHiring && (
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-red-700">Tuyển gấp</div>
                          <div className="text-xs text-red-600">Thông báo đẩy tới Freelancers</div>
                        </div>
                      </div>
                    )}
                    {project.requiresAiQa && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-blue-700">Gói Bảo Hành</div>
                          <div className="text-xs text-blue-600">Đảm bảo hoàn tiền 100%</div>
                        </div>
                      </div>
                    )}
                    {!project.isFeatured && !project.isUrgentHiring && !project.requiresAiQa && (
                      <p className="text-xs text-gray-500">Chưa mua gói nâng cấp nào.</p>
                    )}
                  </div>
                </div>

                {/* Gói lẻ (Ghim/Tuyển gấp/QA) chỉ bán lúc đăng việc — xem các gói đã mua ở Hồ sơ → Gói của tôi */}

                <div className="bg-[#EEF2FF] rounded-[24px] p-6 border border-[#DCE4FF] text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#1D4ED8] rounded-full text-white flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1D4ED8] mb-2">Bạn cần giúp đỡ?</h3>
                  <p className="text-sm text-[#1D4ED8]/80 mb-4">
                    Đội ngũ hỗ trợ của SAM luôn sẵn sàng giải đáp thắc mắc.
                  </p>
                  <button className="w-full py-2.5 rounded-full bg-white text-[#1D4ED8] font-bold text-sm border-0 cursor-pointer shadow-sm">
                    Liên hệ hỗ trợ
                  </button>
                </div>

                {/* Project Action Buttons */}
                <div className="flex flex-col gap-3 mt-6">
                  {project.status === 'CANCELLED' ? (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="w-full py-3 bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold text-sm rounded-full shadow-md hover:opacity-90 transition-opacity cursor-pointer border-0"
                    >
                      Đăng lại dự án
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="w-full py-3 bg-white text-[#1D4ED8] font-bold text-sm border-2 border-[#1D4ED8] rounded-full hover:bg-[#EEF2FF] transition-colors cursor-pointer"
                      >
                        Điều chỉnh dự án
                      </button>
                      {project.status === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="w-full py-3 bg-white text-red-500 font-bold text-sm border-2 border-red-500 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Hủy dự án
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={() => void handleCancel()}
        onCancel={() => setIsDeleteModalOpen(false)}
        title="Hủy dự án"
        message="Bạn có chắc chắn muốn hủy dự án này? Chỉ dự án đang mở mới hủy được."
        confirmText={isCancelling ? 'Đang hủy...' : 'Hủy dự án'}
      />
    </div>
  );
};

export default ClientProjectDetailPage;
