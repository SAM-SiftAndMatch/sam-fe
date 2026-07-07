import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Footer from '../components/Footer';
import {
  PATH_CLIENT_PAYMENT,
  PATH_CLIENT_POST_PROJECT,
  PATH_CLIENT_PROJECTS,
  PATH_WORKSPACE,
} from '../routes/paths';

// === MOCK DATA ===
const PROJECT_DETAIL = {
  id: '1',
  title: 'Phát triển module thanh toán VNPay cho Website Next.js',
  status: 'open',
  budget: '5.000.000 VND',
  createdAt: '2 giờ trước',
  code: 'ID_SAM2024',
  description:
    'Chúng tôi đang tìm kiếm một lập trình viên có kinh nghiệm với Next.js và Node.js để tích hợp cổng thanh toán VNPay vào hệ thống E-commerce hiện có. Yêu cầu xử lý an toàn các giao dịch, quản lý callback/webhook từ VNPay để cập nhật trạng thái đơn hàng, và viết unit test cho các luồng thanh toán quan trọng.',
  skills: ['Next.js', 'Node.js', 'API Integration', 'TypeScript', 'VNPay'],
  upgrades: ['featured', 'urgent'],
};

const PROPOSALS = [
  {
    id: 'p1',
    freelancerName: 'Trần Văn A',
    avatar:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80',
    rating: 4.9,
    reviews: 124,
    proposedPrice: '4.500.000 VND',
    deliveryTime: '5 ngày',
    coverLetter:
      'Chào bạn, tôi là Fullstack Developer với hơn 4 năm kinh nghiệm. Tôi đã từng tích hợp thành công VNPay, Momo và ZaloPay cho 3 dự án Next.js (App Router). Tôi có thể đảm bảo code clean, xử lý webhook bảo mật và bàn giao đúng hạn.',
    isTopRated: true,
  },
  {
    id: 'p2',
    freelancerName: 'Nguyễn Thị B',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    rating: 4.7,
    reviews: 89,
    proposedPrice: '5.000.000 VND',
    deliveryTime: '7 ngày',
    coverLetter:
      'Xin chào, tôi chuyên làm backend Node.js và có sẵn bộ thư viện xử lý chữ ký số (checksum) của VNPay. Việc tích hợp lên Next.js frontend sẽ rất nhanh chóng. Rất mong được hợp tác với bạn.',
    isTopRated: false,
  },
];

const ClientProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(PROJECT_DETAIL);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);

  const handleDelete = () => {
    const saved = JSON.parse(localStorage.getItem('SAM_USER_PROJECTS') || '[]');
    const updated = saved.map((p: any) => {
      if (p.id === id) {
        return { ...p, status: 'cancelled' };
      }
      return p;
    });
    localStorage.setItem('SAM_USER_PROJECTS', JSON.stringify(updated));
    setIsDeleteModalOpen(false);
    navigate(PATH_CLIENT_PROJECTS);
  };

  const handleEdit = () => {
    const budgetValue = project.budget
      ? Number.parseInt(project.budget.toString().replace(/\D/g, ''), 10) || 1000000
      : 1000000;

    const isFeatured = Array.isArray(project.upgrades)
      ? project.upgrades.includes('featured')
      : project.upgrades?.featured || false;

    const isUrgent = Array.isArray(project.upgrades)
      ? project.upgrades.includes('urgent')
      : project.upgrades?.urgent || false;

    const isWarranty = Array.isArray(project.upgrades)
      ? project.upgrades.includes('warranty')
      : project.upgrades?.warranty || false;

    navigate(PATH_CLIENT_POST_PROJECT, {
      state: {
        projectId: project.id,
        projectName: project.title,
        category: project.category || '',
        description: project.description,
        selectedSkills: Array.isArray(project.skills) ? project.skills : [],
        budgetAmount: budgetValue,
        upgrades: {
          featured: isFeatured,
          urgent: isUrgent,
          warranty: isWarranty,
        },
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Đang chờ đề xuất
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold border border-orange-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
            Đang thực hiện
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Đã hoàn thành
          </span>
        );
      case 'cancelled':
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

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('SAM_USER_PROJECTS') || '[]');
    const found = saved.find((p: any) => p.id?.toString() === id?.toString());
    if (found) {
      setProject({ ...PROJECT_DETAIL, ...found });
    } else if (id && !['1', '2', '3', '4'].includes(id)) {
      // if not found and not mock id
    } else {
      setProject(PROJECT_DETAIL);
    }
  }, [id]);

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

        {/* Cột chính */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Thông tin dự án */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
              <div className="flex justify-between items-start mb-4">
                {getStatusBadge(project.status)}
                <span className="text-xs font-semibold text-gray-400">{project.createdAt}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <div className="flex items-center gap-4 text-sm font-semibold text-gray-500 mb-6">
                <span>
                  Mã DA: <span className="text-gray-900">{project.code}</span>
                </span>
                <span>•</span>
                <span>
                  Ngân sách: <span className="text-[#1D4ED8]">{project.budget}</span>
                </span>
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
                {project.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-xs font-bold border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Danh sách đề xuất */}
            {project.status === 'open' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Đề xuất từ Freelancer ({PROPOSALS.length})
                  </h2>
                </div>

                <div className="flex flex-col gap-4">
                  {PROPOSALS.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex flex-col md:flex-row gap-6"
                    >
                      {/* Info Freelancer */}
                      <div className="flex flex-col items-center text-center md:w-1/4">
                        <div className="relative mb-3">
                          <img
                            src={proposal.avatar}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          {proposal.isTopRated && (
                            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white p-1 rounded-full border-2 border-white">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">
                          {proposal.freelancerName}
                        </h4>
                        <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {proposal.rating}{' '}
                          <span className="text-gray-400">({proposal.reviews})</span>
                        </div>
                      </div>

                      {/* Proposal Details */}
                      <div className="md:w-3/4 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              Giá đề xuất
                            </span>
                            <span className="text-lg font-bold text-[#1D4ED8]">
                              {proposal.proposedPrice}
                            </span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              Thời gian giao
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {proposal.deliveryTime}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          "{proposal.coverLetter}"
                        </p>
                        <div className="mt-auto flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedProposal(proposal);
                              setIsHireModalOpen(true);
                            }}
                            className="flex-1 py-2.5 rounded-full bg-[#1D4ED8] hover:bg-[#153bb5] text-white font-bold transition-colors cursor-pointer text-sm border-0 shadow-md"
                          >
                            Giao việc ngay
                          </button>
                          <button
                            onClick={() => {
                              // Save workspace entry to localStorage
                              const workspaces = JSON.parse(
                                localStorage.getItem('SAM_WORKSPACES') || '[]'
                              );
                              const wsKey = `${project.id}_${proposal.id}`;
                              const exists = workspaces.some((w: any) => w.id === wsKey);
                              if (!exists) {
                                workspaces.push({
                                  id: wsKey,
                                  projectId: project.id?.toString(),
                                  projectName: project.title,
                                  freelancerId: proposal.id,
                                  freelancerName: proposal.freelancerName,
                                  freelancerAvatar: proposal.avatar,
                                  lastMessage: 'Cuộc trò chuyện mới được tạo',
                                  lastMessageTime: 'Vừa xong',
                                  unreadCount: 0,
                                  status: 'chatting',
                                  createdAt: new Date().toISOString(),
                                });
                                localStorage.setItem('SAM_WORKSPACES', JSON.stringify(workspaces));
                              }
                              navigate(`/workspace/${project.id}`, {
                                state: { role: 'client', freelancer: proposal, project },
                              });
                            }}
                            className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors cursor-pointer text-sm bg-white"
                          >
                            Nhắn tin
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trạng thái Đang thực hiện */}
            {project.status === 'in_progress' && (
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Dự án đang được thực hiện</h3>
                <p className="text-gray-600 text-sm mb-6 max-w-md">
                  Freelancer đã được giao việc và đang trong quá trình thực hiện dự án. Mọi trao đổi
                  và giao nhận file sẽ diễn ra tại Phòng làm việc.
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
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
                Gói nâng cấp đã mua
              </h3>
              <div className="flex flex-col gap-3">
                {(Array.isArray(project.upgrades)
                  ? project.upgrades
                  : Object.keys(project.upgrades || {}).filter((k) => project.upgrades[k])
                ).includes('featured') && (
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
                {(Array.isArray(project.upgrades)
                  ? project.upgrades
                  : Object.keys(project.upgrades || {}).filter((k) => project.upgrades[k])
                ).includes('urgent') && (
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
                {(Array.isArray(project.upgrades)
                  ? project.upgrades
                  : Object.keys(project.upgrades || {}).filter((k) => project.upgrades[k])
                ).includes('warranty') && (
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
              </div>
            </div>

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
              {project.status === 'cancelled' ? (
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
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="w-full py-3 bg-white text-red-500 font-bold text-sm border-2 border-red-500 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Xóa dự án
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={isHireModalOpen}
        isDanger={false}
        title="Xác nhận giao việc"
        message={`Bạn đang chuẩn bị giao việc cho Freelancer ${selectedProposal?.freelancerName}. Bạn sẽ được chuyển sang trang thanh toán cọc an toàn.`}
        confirmText="Thanh toán cọc và giao việc"
        onConfirm={() => {
          setIsHireModalOpen(false);
          if (selectedProposal) {
            navigate(
              PATH_CLIENT_PAYMENT.replace(':projectId', project.id.toString()).replace(
                ':freelancerId',
                selectedProposal.id
              )
            );
          }
        }}
        onCancel={() => setIsHireModalOpen(false)}
      />
    </div>
  );
};

export default ClientProjectDetailPage;
