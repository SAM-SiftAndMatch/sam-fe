import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { PATH_FREELANCER_PROJECTS } from '../routes/paths';

// === MOCK DATA ===
const PROJECTS_DATA: Record<string, any> = {
  fp1: {
    id: 'fp1',
    title: 'Phát triển module thanh toán VNPay cho Website Next.js',
    clientName: 'Công ty ABC Tech',
    clientAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80',
    status: 'in_progress',
    budget: 5000000,
    deadline: '20/07/2024',
    startedAt: '01/07/2024',
    progress: 65,
    description: 'Tích hợp cổng thanh toán VNPay vào hệ thống E-commerce hiện có bằng Next.js và Node.js. Yêu cầu xử lý an toàn các giao dịch, quản lý callback/webhook từ VNPay.',
    skills: ['Next.js', 'Node.js', 'API Integration', 'TypeScript'],
    contractCode: 'SAM-HD-2024-001',
  },
  fp2: {
    id: 'fp2',
    title: 'Dịch thuật bộ hợp đồng thương mại Việt - Anh (50 trang)',
    clientName: 'Nguyễn Minh Hoàng',
    clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    status: 'pending_review',
    budget: 3500000,
    deadline: '15/07/2024',
    startedAt: '28/06/2024',
    progress: 100,
    reviewStatus: 'waiting',
    description: 'Dịch thuật chuyên nghiệp bộ hợp đồng thương mại song ngữ Việt - Anh, đảm bảo chính xác thuật ngữ pháp lý.',
    skills: ['Dịch thuật', 'Tiếng Anh', 'Pháp lý'],
    contractCode: 'SAM-HD-2024-002',
  },
  fp3: {
    id: 'fp3',
    title: 'Thiết kế bộ nhận diện thương hiệu cho Startup F&B',
    clientName: 'Trà Sữa TocoToco',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    status: 'pending_review',
    budget: 8000000,
    deadline: '10/07/2024',
    startedAt: '20/06/2024',
    progress: 100,
    reviewStatus: 'approved',
    description: 'Thiết kế toàn bộ bộ nhận diện thương hiệu bao gồm logo, bảng màu, typography, name card, packaging và brand guideline.',
    skills: ['Graphic Design', 'Branding', 'Adobe Illustrator'],
    contractCode: 'SAM-HD-2024-003',
  },
  fp4: {
    id: 'fp4',
    title: 'Viết nội dung SEO cho 20 trang sản phẩm E-commerce',
    clientName: 'Shop Mẹ và Bé',
    clientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
    status: 'pending_review',
    budget: 4000000,
    deadline: '18/07/2024',
    startedAt: '05/07/2024',
    progress: 100,
    reviewStatus: 'revision_requested',
    description: 'Viết nội dung mô tả sản phẩm tối ưu SEO cho 20 trang sản phẩm trên website E-commerce bán đồ mẹ và bé.',
    skills: ['SEO', 'Content Writing', 'E-commerce'],
    contractCode: 'SAM-HD-2024-004',
    revisionItems: [
      'Chỉnh sửa từ khóa chính ở 3 trang sản phẩm (SP005, SP012, SP018) - từ khóa chưa khớp với nhóm ngành.',
      'Bổ sung thêm bullet points mô tả tính năng cho sản phẩm "Bỉm Merries size L".',
      'Cập nhật meta description cho 2 trang bị trùng lặp nội dung.',
    ],
  },
  fp5: {
    id: 'fp5',
    title: 'Viết script Python tự động crawl dữ liệu chứng khoán',
    clientName: 'Lê Hoàng Dũng',
    clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    status: 'completed',
    budget: 2000000,
    deadline: '01/07/2024',
    startedAt: '15/06/2024',
    progress: 100,
    rating: 5,
    description: 'Script Python tự động crawl dữ liệu chứng khoán từ các sàn HOSE, HNX, UPCOM.',
    skills: ['Python', 'Web Scraping', 'Data'],
    contractCode: 'SAM-HD-2024-005',
  },
  fp6: {
    id: 'fp6',
    title: 'Dự án bị hủy do thay đổi yêu cầu',
    clientName: 'Công ty XYZ',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    status: 'cancelled',
    budget: 6000000,
    deadline: '25/07/2024',
    startedAt: '10/07/2024',
    progress: 20,
    description: 'Dự án thiết kế web app quản lý kho hàng.',
    skills: ['React', 'Node.js'],
    contractCode: 'SAM-HD-2024-006',
  },
};

const AI_REVISION_ITEMS = [
  'Chỉnh sửa lỗi format tại section 3.2 - Bảng giá chưa căn chỉnh đúng chuẩn.',
  'Bổ sung phần mô tả chi tiết cho module xử lý thanh toán (đã có trong scope ban đầu).',
  'Cập nhật lại naming convention của 2 file component cho đồng bộ với codebase.',
];

const FreelancerProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (id && PROJECTS_DATA[id]) {
      setProject({ ...PROJECTS_DATA[id] });
    }
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Không tìm thấy dự án.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' VND';
  const commissionRate = 0.06;
  const commissionAmount = project.budget * commissionRate;
  const netAmount = project.budget - commissionAmount;

  const handleDeliverProduct = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisComplete(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setAnalysisComplete(true);
          setTimeout(() => {
            setProject((prev: any) => ({
              ...prev,
              status: 'pending_review',
              reviewStatus: 'waiting',
              progress: 100,
            }));
            setIsAnalyzing(false);
            setAnalysisComplete(false);
          }, 2000);
        }, 500);
      }
      setAnalysisProgress(Math.min(100, Math.round(progress)));
    }, 300);
  };

  const handleSimulateApproved = () => {
    setProject((prev: any) => ({ ...prev, reviewStatus: 'approved' }));
  };

  const handleSimulateRevision = () => {
    setProject((prev: any) => ({
      ...prev,
      reviewStatus: 'revision_requested',
      revisionItems: AI_REVISION_ITEMS,
    }));
  };

  const handleSimulateWaiting = () => {
    setProject((prev: any) => ({ ...prev, reviewStatus: 'waiting' }));
  };

  const handleResubmit = () => {
    handleDeliverProduct();
  };

  const handleConfirmPayment = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setShowPaymentModal(false);
      setPaymentSuccess(false);
      setProject((prev: any) => ({ ...prev, status: 'completed', rating: 5 }));
    }, 2500);
  };

  const getStatusBadge = (status: string, reviewStatus?: string) => {
    if (status === 'pending_review') {
      if (reviewStatus === 'approved') {
        return (
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Đã duyệt
          </span>
        );
      }
      if (reviewStatus === 'revision_requested') {
        return (
          <span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Yêu cầu sửa chữa
          </span>
        );
      }
      return (
        <span className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1.5 w-fit">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
          Chờ nghiệm thu
        </span>
      );
    }
    switch (status) {
      case 'in_progress':
        return (
          <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Đang thực hiện
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(PATH_FREELANCER_PROJECTS)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors cursor-pointer bg-transparent border-0 w-fit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          {/* Main Column */}
          <div className="flex flex-col gap-6">
            {/* Project Info */}
            <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
              <div className="flex justify-between items-start mb-4">
                {getStatusBadge(project.status, project.reviewStatus)}
                <span className="text-xs font-semibold text-gray-400">Mã HĐ: {project.contractCode}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <div className="flex items-center gap-4 text-sm font-semibold text-gray-500 mb-6">
                <span>
                  Giá trị: <span className="text-[#1D4ED8]">{formatCurrency(project.budget)}</span>
                </span>
                <span>•</span>
                <span>
                  Deadline: <span className="text-gray-900">{project.deadline}</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Mô tả dự án</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{project.description}</p>

              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Kỹ năng</h3>
              <div className="flex flex-wrap gap-2">
                {project.skills?.map((skill: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-xs font-bold border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* === STATUS-SPECIFIC SECTIONS === */}

            {/* Đang thực hiện - Giao sản phẩm */}
            {project.status === 'in_progress' && !isAnalyzing && (
              <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#1D4ED8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Giao sản phẩm
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Khi bạn đã hoàn thành sản phẩm, bấm nút bên dưới để giao cho khách hàng. AI sẽ kiểm tra sản phẩm đầu ra trước khi gửi đi.
                </p>
                <button
                  type="button"
                  onClick={handleDeliverProduct}
                  className="w-full py-3.5 bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold rounded-full shadow-lg hover:opacity-90 transition-all cursor-pointer border-0 text-sm"
                >
                  Giao sản phẩm cho khách hàng
                </button>
              </div>
            )}

            {/* AI Analyzing Animation */}
            {isAnalyzing && (
              <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${analysisComplete ? 'bg-emerald-50' : 'bg-blue-50'} transition-colors`}>
                    {analysisComplete ? (
                      <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-[#1D4ED8] animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {analysisComplete ? 'Sản phẩm đạt chuẩn yêu cầu!' : 'AI đang phân tích sản phẩm...'}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-md">
                    {analysisComplete
                      ? 'Sản phẩm đã được kiểm tra và đáp ứng đầy đủ yêu cầu trong hợp đồng. Đang chuyển sang trạng thái Chờ nghiệm thu...'
                      : 'Hệ thống đang kiểm tra sản phẩm đầu ra so với yêu cầu trong hợp đồng. Vui lòng chờ trong giây lát.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full max-w-sm">
                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                      <span>Tiến trình phân tích</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${analysisComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7]'}`}
                        style={{ width: `${analysisProgress}%` }}
                      />
                    </div>
                    <div className="mt-4 text-xs text-gray-400 space-y-1">
                      <p className={analysisProgress > 20 ? 'text-gray-600' : ''}>✓ Kiểm tra tính đầy đủ của file...</p>
                      <p className={analysisProgress > 50 ? 'text-gray-600' : ''}>✓ So sánh với yêu cầu hợp đồng...</p>
                      <p className={analysisProgress > 80 ? 'text-gray-600' : ''}>✓ Đánh giá chất lượng đầu ra...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chờ nghiệm thu - Waiting */}
            {project.status === 'pending_review' && project.reviewStatus === 'waiting' && (
              <div className="bg-[#F5F3FF] rounded-[24px] p-8 border border-[#E9E5FF] text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Đang chờ khách hàng nghiệm thu</h3>
                <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                  Sản phẩm đã được giao thành công. Khách hàng đang xem xét và đánh giá. Bạn sẽ nhận thông báo khi có phản hồi.
                </p>

                {/* Simulation Buttons */}
                <div className="mt-6 p-4 bg-white/60 rounded-xl border border-purple-100">
                  <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3">⚡ Giả lập phản hồi từ khách hàng</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={handleSimulateApproved}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-full text-xs font-bold cursor-pointer border-0 hover:bg-emerald-600 transition-colors"
                    >
                      ✓ Khách hàng duyệt
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateRevision}
                      className="px-4 py-2 bg-amber-500 text-white rounded-full text-xs font-bold cursor-pointer border-0 hover:bg-amber-600 transition-colors"
                    >
                      ✎ Yêu cầu sửa chữa
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chờ nghiệm thu - Approved */}
            {project.status === 'pending_review' && project.reviewStatus === 'approved' && (
              <div className="bg-emerald-50 rounded-[24px] p-8 border border-emerald-100 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">🎉 Khách hàng đã duyệt sản phẩm!</h3>
                <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                  Khách hàng hài lòng với sản phẩm của bạn. Bấm nút bên dưới để xác nhận nhận thanh toán.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:opacity-90 transition-all cursor-pointer border-0 text-sm"
                >
                  Xác nhận nhận tiền
                </button>
              </div>
            )}

            {/* Chờ nghiệm thu - Revision Requested */}
            {project.status === 'pending_review' && project.reviewStatus === 'revision_requested' && (
              <div className="bg-white rounded-[24px] p-8 border border-amber-200 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Khách hàng yêu cầu sửa chữa</h2>
                    <p className="text-xs text-gray-500">AI đã kiểm tra - Các yêu cầu nằm trong phạm vi hợp đồng</p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-6">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">
                    Danh sách cần thay đổi
                  </p>
                  <ul className="space-y-3">
                    {(project.revisionItems || AI_REVISION_ITEMS).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-6 flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700">
                    <strong>Thông báo từ AI:</strong> Đã kiểm tra, không có thêm yêu cầu nào khác ngoài phạm vi hợp đồng.
                    Chỉ cần chỉnh sửa các mục đã liệt kê ở trên.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResubmit}
                  className="w-full py-3.5 bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold rounded-full shadow-lg hover:opacity-90 transition-all cursor-pointer border-0 text-sm"
                >
                  Giao sản phẩm (đã sửa chữa)
                </button>
              </div>
            )}

            {/* Completed State */}
            {project.status === 'completed' && (
              <div className="bg-emerald-50 rounded-[24px] p-8 border border-emerald-100 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Dự án đã hoàn thành! 🎉</h3>
                <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                  Cảm ơn bạn đã hoàn thành dự án. Thanh toán đã được xử lý và cộng vào thu nhập.
                </p>
                {project.rating && (
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= project.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm font-bold text-gray-700">{project.rating}/5</span>
                  </div>
                )}
              </div>
            )}

            {/* Cancelled State */}
            {project.status === 'cancelled' && (
              <div className="bg-red-50 rounded-[24px] p-8 border border-red-100 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Dự án đã bị hủy</h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  Dự án đã bị hủy bởi khách hàng. Nếu có thắc mắc, vui lòng liên hệ đội ngũ hỗ trợ SAM.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Client Info */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Khách hàng</h3>
              <div className="flex items-center gap-3 mb-4">
                <img src={project.clientAvatar} alt="Client" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{project.clientName}</p>
                  <p className="text-xs text-gray-400">Khách hàng SAM</p>
                </div>
              </div>
            </div>

            {/* Contract Summary */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Thông tin hợp đồng</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Mã hợp đồng</span>
                  <span className="text-xs font-bold text-gray-900">{project.contractCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Giá trị</span>
                  <span className="text-xs font-bold text-[#1D4ED8]">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Ngày bắt đầu</span>
                  <span className="text-xs font-bold text-gray-900">{project.startedAt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Hạn chót</span>
                  <span className="text-xs font-bold text-gray-900">{project.deadline}</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Phí sàn (6%)</span>
                  <span className="text-xs font-bold text-red-500">-{formatCurrency(commissionAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-900">Thực nhận</span>
                  <span className="text-sm font-black text-emerald-600">{formatCurrency(netAmount)}</span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-[#EEF2FF] rounded-[24px] p-6 border border-[#DCE4FF] text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-[#1D4ED8] rounded-full text-white flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1D4ED8] mb-2">Bạn cần giúp đỡ?</h3>
              <p className="text-sm text-[#1D4ED8]/80 mb-4">Đội ngũ hỗ trợ SAM luôn sẵn sàng.</p>
              <button className="w-full py-2.5 rounded-full bg-white text-[#1D4ED8] font-bold text-sm border-0 cursor-pointer shadow-sm">
                Liên hệ hỗ trợ
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* === PAYMENT MODAL === */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !paymentSuccess && setShowPaymentModal(false)}>
          <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {!paymentSuccess ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận nhận thanh toán</h3>
                  <p className="text-gray-500 text-sm">Dưới đây là chi tiết thanh toán cho dự án của bạn.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tổng giá trị dự án</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Phí hoa hồng sàn (6%)</span>
                    <span className="text-sm font-bold text-red-500">-{formatCurrency(commissionAmount)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">Số tiền thực nhận</span>
                    <span className="text-lg font-black text-emerald-600">{formatCurrency(netAmount)}</span>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-3 mb-6 flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-amber-700">Tiền sẽ được cộng vào số dư khả dụng trong tài khoản thu nhập của bạn.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-colors cursor-pointer text-sm bg-white"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:opacity-90 transition-all cursor-pointer border-0 text-sm"
                  >
                    Xác nhận
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thanh toán thành công! 🎉</h3>
                <p className="text-gray-500 text-sm mb-2">
                  Số tiền <strong className="text-emerald-600">{formatCurrency(netAmount)}</strong> đã được cộng vào thu nhập của bạn.
                </p>
                <p className="text-xs text-gray-400">Đang chuyển hướng...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProjectDetailPage;
