import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { PATH_CLIENT_PROJECT_DETAIL, PATH_WORKSPACE } from '../routes/paths';

const ClientPaymentPage: React.FC = () => {
  const { projectId, freelancerId } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [freelancer, setFreelancer] = useState<any>(null);

  useEffect(() => {
    // Fetch project
    const savedProjects = JSON.parse(localStorage.getItem('SAM_USER_PROJECTS') || '[]');
    const currentProject = savedProjects.find(
      (p: any) => p.id?.toString() === projectId?.toString()
    );

    // Default fallback project if not found (for previewing purpose)
    const activeProject = currentProject || {
      id: projectId || '1',
      title: 'Phát triển module thanh toán VNPay cho Website Next.js',
      budget: '5.000.000 VND',
    };
    setProject(activeProject);

    // MOCK Freelancer lookup (Normally we'd fetch this from Applications)
    const mockFreelancers: Record<string, any> = {
      p1: {
        name: 'Trần Văn A',
        price: '4.500.000 VND',
        avatar:
          'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80',
        rating: 4.9,
      },
      p2: {
        name: 'Nguyễn Thị B',
        price: '5.000.000 VND',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        rating: 4.7,
      },
    };

    setFreelancer(mockFreelancers[freelancerId || 'p1'] || mockFreelancers.p1);
  }, [projectId, freelancerId]);

  const handlePaymentAndAssign = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // 1. Update Project Status to in_progress
      const savedProjects = JSON.parse(localStorage.getItem('SAM_USER_PROJECTS') || '[]');
      let isFound = false;
      const updatedProjects = savedProjects.map((p: any) => {
        if (p.id?.toString() === projectId?.toString()) {
          isFound = true;
          return {
            ...p,
            status: 'in_progress',
            assignedFreelancerId: freelancerId,
            agreedPrice: freelancer.price,
            assignedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      if (!isFound && project) {
        updatedProjects.push({
          ...project,
          status: 'in_progress',
          assignedFreelancerId: freelancerId,
          agreedPrice: freelancer.price,
          assignedAt: new Date().toISOString(),
        });
      }

      localStorage.setItem('SAM_USER_PROJECTS', JSON.stringify(updatedProjects));

      // 2. Update Applications
      const savedApps = JSON.parse(localStorage.getItem('SAM_FREELANCER_APPLICATIONS') || '[]');
      const updatedApps = savedApps.map((app: any) => {
        if (app.jobId.toString() === projectId?.toString()) {
          // If this is the chosen freelancer (mocking logic by id, normally we'd match freelancerId properly)
          return { ...app, status: 'rejected' }; // Simulating all others rejected
        }
        return app;
      });
      // In a real app we'd also mark the exact application as 'approved'.
      localStorage.setItem('SAM_FREELANCER_APPLICATIONS', JSON.stringify(updatedApps));

      // 3. Update or create workspace entry
      const workspaces = JSON.parse(localStorage.getItem('SAM_WORKSPACES') || '[]');
      const wsKey = `${projectId}_${freelancerId}`;
      let wsFound = false;
      const updatedWorkspaces = workspaces.map((w: any) => {
        if (w.projectId?.toString() === projectId?.toString() && w.freelancerId === freelancerId) {
          wsFound = true;
          return {
            ...w,
            status: 'in_progress',
            lastMessage: 'Dự án đã được giao, bắt đầu làm việc nhé!',
            lastMessageTime: 'Vừa xong',
            unreadCount: 1,
          };
        }
        return w;
      });
      if (!wsFound) {
        updatedWorkspaces.push({
          id: wsKey,
          projectId: projectId?.toString(),
          projectName: project?.title || 'Dự án',
          freelancerId: freelancerId,
          freelancerName: freelancer.name,
          freelancerAvatar: freelancer.avatar,
          lastMessage: 'Dự án đã được giao, bắt đầu làm việc nhé!',
          lastMessageTime: 'Vừa xong',
          unreadCount: 1,
          status: 'in_progress',
          createdAt: new Date().toISOString(),
        });
      }
      localStorage.setItem('SAM_WORKSPACES', JSON.stringify(updatedWorkspaces));

      // 3. Navigate to workspace
      navigate(PATH_WORKSPACE.replace(':projectId', projectId || '1'));
    }, 2000);
  };

  if (!project || !freelancer) return <div className="min-h-screen bg-[#F8FAFC]" />;

  const basePriceNum = Number.parseInt(freelancer.price.replace(/\D/g, '')) || 0;
  const platformFeeNum = basePriceNum * 0.08;
  const totalPriceNum = basePriceNum + platformFeeNum;

  const formatCurrency = (num: number) => `${new Intl.NumberFormat('vi-VN').format(num)} VND`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <ClientDashboardHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
        <button
          type="button"
          onClick={() => navigate(PATH_CLIENT_PROJECT_DETAIL.replace(':id', projectId || '1'))}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors cursor-pointer bg-transparent border-0 w-fit"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại dự án
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán cọc & Giao việc</h1>
            <p className="text-gray-500 text-sm mb-6">
              Vui lòng kiểm tra lại thông tin giao dịch trước khi xác nhận. Số tiền của bạn sẽ được
              nền tảng bảo lưu (Escrow) và chỉ thanh toán cho Freelancer khi bạn nghiệm thu công
              việc.
            </p>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Chi tiết dự án</h2>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Dự án</div>
                    <div className="font-bold text-gray-900">{project.title}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Freelancer thực hiện</div>
                    <div className="flex items-center gap-3 mt-2">
                      <img
                        src={freelancer.avatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{freelancer.name}</div>
                        <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {freelancer.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm font-bold text-gray-900">Chi phí thỏa thuận</div>
                  <div className="text-lg font-black text-[#1D4ED8]">{freelancer.price}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#EEF2FF] rounded-2xl p-5 border border-[#E0E7FF] flex gap-4 mt-2">
              <svg
                className="w-6 h-6 text-[#1D4ED8] shrink-0"
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
              <div>
                <h4 className="text-sm font-bold text-[#1D4ED8] mb-1">Thanh toán an toàn 100%</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Tiền của bạn được nền tảng giữ an toàn. Freelancer chỉ nhận được tiền sau khi dự
                  án hoàn thành và được bạn xác nhận nghiệm thu thành công.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Method */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Tóm tắt thanh toán</h2>

              <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Giá trị dự án</span>
                  <span className="font-bold text-gray-900">{freelancer.price}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí nền tảng (8%)</span>
                  <span className="font-bold text-gray-900">{formatCurrency(platformFeeNum)}</span>
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-900">Tổng cộng (Cần cọc)</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7]">
                    {formatCurrency(totalPriceNum)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePaymentAndAssign}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold py-4 rounded-2xl shadow-[0_4px_20px_rgba(29,78,216,0.3)] hover:opacity-90 transition-all flex justify-center items-center gap-2 cursor-pointer border-0 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Đang xử lý thanh toán...
                  </>
                ) : (
                  'Thanh toán & Giao việc ngay'
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="text-xs text-gray-400 font-medium">
                  Mã hóa bảo mật SSL 256-bit
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientPaymentPage;
