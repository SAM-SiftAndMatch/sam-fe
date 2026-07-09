import type React from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Header from '../components/Header';

const WorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [project, setProject] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>({
    name: 'Nguyễn Linh Chi',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80',
  });

  // Product Review States
  const [productState, setProductState] = useState<
    'pending' | 'checking' | 'review' | 'approved' | 'revision'
  >('pending');
  const [aiCheckProgress, setAiCheckProgress] = useState(0);
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionText, setRevisionText] = useState('');

  const handleStartAiCheck = () => {
    setProductState('checking');
    setAiCheckProgress(0);
    const interval = setInterval(() => {
      setAiCheckProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setProductState('review'), 500);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 400);
  };

  useEffect(() => {
    const passedRole = location.state?.role;
    const passedFreelancer = location.state?.freelancer;
    const passedProject = location.state?.project;
    const savedRole = localStorage.getItem('SAM_ROLE');
    const currentRole =
      passedRole === 'freelancer' || savedRole === 'freelancer' ? 'freelancer' : 'client';
    setRole(currentRole);
    localStorage.setItem('SAM_ROLE', currentRole);

    const savedProjects = JSON.parse(localStorage.getItem('SAM_USER_PROJECTS') || '[]');
    let foundProject = savedProjects.find((p: any) => p.id?.toString() === projectId?.toString());

    if (!foundProject && passedProject) {
      foundProject = passedProject;
    }

    if (foundProject) {
      setProject(foundProject);
      // Mock other user info based on role and assignment
      if (currentRole === 'client' && (foundProject.assignedFreelancerId || passedFreelancer)) {
        if (passedFreelancer) {
          setOtherUser({
            id: passedFreelancer.id,
            name: passedFreelancer.name,
            avatar: passedFreelancer.avatar || `https://i.pravatar.cc/150?u=${passedFreelancer.id}`,
          });
        } else {
          const mockFreelancers: Record<string, any> = {
            p1: {
              name: 'Trần Văn A',
              avatar:
                'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80',
            },
            p2: {
              name: 'Nguyễn Thị B',
              avatar:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
            },
          };
          setOtherUser(mockFreelancers[foundProject.assignedFreelancerId] || mockFreelancers.p1);
        }
      } else {
        setOtherUser({
          id: 'client1',
          name: 'Khách hàng',
          avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
        });
      }
    } else {
      setProject({ title: 'Project Alpha' });
    }
  }, [location.state, projectId]);

  return (
    <div className="h-screen bg-[#F8FAFC] font-sans flex flex-col overflow-hidden">
      {/* 1. Kế thừa Header linh hoạt theo Role */}
      {role === 'client' ? <ClientDashboardHeader /> : <Header />}

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* ================= CỘT TRÁI (LEFT SIDEBAR) ================= */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6 lg:h-full lg:overflow-y-auto lg:pr-2 hidden lg:flex">
          {/* Project Identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              PA
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight line-clamp-1">
                {project?.title || 'Project Alpha'}
              </h2>
              <span className="text-[10px] font-bold text-[#1D4ED8] tracking-widest uppercase">
                Active Sprint
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white shadow-[0_4px_15px_rgba(29,78,216,0.3)] transition-all cursor-pointer border-0 text-left"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Chat"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="font-semibold text-sm">Tin nhắn</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition-all cursor-pointer border-0 text-left"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Tasks"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span className="font-medium text-sm">Công việc</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition-all cursor-pointer border-0 text-left"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Files"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              <span className="font-medium text-sm">Tài liệu</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition-all cursor-pointer border-0 text-left"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Milestones"
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
              <span className="font-medium text-sm">Tiến độ</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition-all cursor-pointer border-0 text-left"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Analytics"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              <span className="font-medium text-sm">Thống kê</span>
            </button>
          </nav>

          {project?.status === 'open' && (
            <div className="mt-4 pt-6 border-t border-gray-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate(`/client/payment/${project.id}/${otherUser.id || 'freelancer1'}`)
                }
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#00A3FF] hover:bg-[#0092E6] text-white shadow-md transition-all cursor-pointer border-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Hire"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="font-bold text-sm">Giao việc ngay</span>
              </button>
            </div>
          )}

          <nav className="mt-auto flex flex-col gap-1 pb-4">
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-gray-500 hover:bg-white transition-all cursor-pointer border-0 text-left"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Archive"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span className="font-medium text-sm">Lưu trữ</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-gray-500 hover:bg-white transition-all cursor-pointer border-0 text-left"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Support"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium text-sm">Hỗ trợ</span>
            </button>
          </nav>
        </aside>

        {/* ================= CỘT GIỮA (CHAT AREA) ================= */}
        <section className="flex-1 flex flex-col min-w-0 h-full border border-gray-100 bg-white/50 backdrop-blur-sm rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          {/* Chat Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-[32px] shadow-sm z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0">
                  <img src={otherUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">
                  {otherUser.name}
                </h3>
                <p className="text-[11px] font-bold text-[#1D4ED8] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] animate-pulse" />
                  Đang soạn tin nhắn...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#EEF2FF] text-[#1D4ED8] hover:bg-[#E0E7FF] transition-colors cursor-pointer border-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Video Call"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#EEF2FF] text-[#1D4ED8] hover:bg-[#E0E7FF] transition-colors cursor-pointer border-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Audio Call"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 hide-scrollbar">
            {/* AI Summary Block */}
            <div className="bg-[#EEF2FF] rounded-3xl p-5 border border-[#E0E7FF] shadow-sm relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#00A3FF] flex items-center justify-center text-white">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      role="img"
                      aria-label="AI Summary"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-widest">
                    AI Tóm tắt (5 Phút qua)
                  </span>
                </div>
                <button
                  type="button"
                  className="text-[10px] font-bold text-[#1D4ED8] uppercase hover:underline cursor-pointer bg-transparent border-0"
                >
                  Xem chi tiết
                </button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed font-medium pl-10">
                Chi vừa cập nhật xong kiến trúc API cho module Chatbot. Cô ấy cần TechFlow xác nhận
                danh sách các intent chính trước 14:00 hôm nay.
              </p>
            </div>

            {/* Client Message (Left) */}
            <div className="flex flex-col items-start gap-1.5 max-w-[80%]">
              <div className="bg-white text-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 text-sm leading-relaxed">
                Chào Chi, mình đã nhận được bản draft cho hệ thống Chatbot AI rồi. Trông rất hứa
                hẹn!
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                TechFlow Solutions • 09:15
              </div>
            </div>

            {/* Freelancer Message (Right) */}
            <div className="flex flex-col items-end gap-1.5 max-w-[80%] self-end">
              <div className="bg-[#1D4ED8] text-white p-4 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed">
                Cảm ơn anh. Em đã tích hợp bộ xử lý ngôn ngữ tự nhiên mới nhất. Anh có thể xem qua
                file mô tả kiến trúc em vừa tải lên không?
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">
                09:17
              </div>
            </div>

            {/* Freelancer File Attachment (Right) */}
            <div className="flex flex-col items-end gap-1.5 max-w-[80%] self-end mt-[-10px]">
              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tr-sm shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#1D4ED8] transition-colors">
                <div className="w-10 h-10 bg-[#1D4ED8] rounded-lg flex items-center justify-center text-white shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="PDF File"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 line-clamp-1">
                    Architecture_Chatbot_V2.pdf
                  </span>
                  <span className="text-[11px] font-semibold text-gray-500">
                    2.4 MB • Tài liệu PDF
                  </span>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center ml-2 border-0 cursor-pointer hover:bg-[#E0E7FF]"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    role="img"
                    aria-label="Download"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Client Message (Left) */}
            <div className="flex flex-col items-start gap-1.5 max-w-[80%]">
              <div className="bg-white text-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 text-sm leading-relaxed">
                Để mình kiểm tra. Nếu ổn, mình sẽ xác nhận mốc thanh toán tiếp theo ngay.
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                TechFlow Solutions • 09:25
              </div>
            </div>
          </div>

          {/* Chat Input Area */}
          <div className="p-6 bg-transparent">
            <div className="bg-white border border-gray-200 rounded-[28px] p-2 flex flex-col shadow-[0_10px_30px_rgb(0,0,0,0.05)] focus-within:border-[#1D4ED8] focus-within:ring-1 focus-within:ring-[#1D4ED8] transition-all">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-[#1D4ED8] hover:bg-[#00A3FF] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0 shadow-sm"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    role="img"
                    aria-label="AI Stars"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  AI Assistant
                </button>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border-0"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Attach File"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border-0"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Attach Image"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>

              {/* Input */}
              <div className="flex items-end gap-2 px-3 pb-2 pt-1">
                <input
                  type="text"
                  aria-label="Nhập nội dung tin nhắn"
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                  className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-2 resize-none outline-none text-gray-700 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  className="w-10 h-10 bg-[#1D4ED8] hover:bg-[#00B2FF] text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-md cursor-pointer border-0"
                >
                  <svg
                    className="w-4 h-4 ml-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    role="img"
                    aria-label="Send Message"
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

        {/* ================= CỘT PHẢI (RIGHT SIDEBAR) ================= */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4 lg:h-full lg:overflow-y-auto lg:pr-2 pb-10 lg:pb-0 lg:hidden xl:flex">
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col h-full min-h-[400px]">
            <h3 className="text-[17px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#1D4ED8]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Sản phẩm bàn giao
            </h3>

            {/* File đính kèm */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold text-gray-900 line-clamp-1">
                  Final_SourceCode.zip
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  24.5 MB • Gửi lúc 14:30 hôm nay
                </span>
              </div>
            </div>

            {/* Trạng thái Pending Check */}
            {productState === 'pending' && (
              <div className="flex flex-col gap-3 mt-auto">
                <p className="text-xs text-gray-500 text-center mb-2">
                  Freelancer vừa gửi sản phẩm bàn giao. Hãy sử dụng AI để kiểm tra mã độc và đánh
                  giá chất lượng trước khi duyệt.
                </p>
                <button
                  type="button"
                  onClick={handleStartAiCheck}
                  className="w-full py-3.5 bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all cursor-pointer border-0 text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  AI Phân tích sản phẩm
                </button>
              </div>
            )}

            {/* Trạng thái Checking */}
            {productState === 'checking' && (
              <div className="flex flex-col items-center justify-center py-6 mt-4">
                <div className="w-16 h-16 relative flex items-center justify-center mb-4">
                  <svg className="w-full h-full text-gray-200 absolute" viewBox="0 0 36 36">
                    <path
                      className="stroke-current"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <svg
                    className="w-full h-full text-[#1D4ED8] absolute animate-[spin_2s_linear_infinite]"
                    viewBox="0 0 36 36"
                    strokeDasharray={`${Math.min(100, Math.max(0, aiCheckProgress))}, 100`}
                  >
                    <path
                      className="stroke-current"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="text-xs font-bold text-[#1D4ED8] absolute">
                    {Math.round(Math.min(100, aiCheckProgress))}%
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">AI đang kiểm tra...</h4>
                <div className="text-[10px] text-gray-500 flex flex-col items-center gap-1">
                  <span className={aiCheckProgress > 20 ? 'text-[#1D4ED8]' : ''}>
                    Kiểm tra tính an toàn & mã độc...
                  </span>
                  <span className={aiCheckProgress > 60 ? 'text-[#1D4ED8]' : ''}>
                    Đối chiếu yêu cầu dự án...
                  </span>
                  <span className={aiCheckProgress > 90 ? 'text-[#1D4ED8]' : ''}>
                    Đánh giá chất lượng code...
                  </span>
                </div>
              </div>
            )}

            {/* Trạng thái Review */}
            {productState === 'review' && (
              <div className="flex flex-col gap-4 mt-auto">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col gap-2 mb-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    AI Đánh giá: Đạt yêu cầu
                  </div>
                  <ul className="text-xs text-emerald-700/80 space-y-1.5 list-disc pl-4">
                    <li>Không phát hiện mã độc (0/54 engines detect).</li>
                    <li>Source code đầy đủ các module yêu cầu.</li>
                    <li>Chất lượng đầu ra khớp với JD mô tả.</li>
                  </ul>
                </div>

                {!showRevisionInput ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRevisionInput(true)}
                      className="flex-1 py-3 bg-white border-2 border-amber-500 text-amber-600 font-bold rounded-xl hover:bg-amber-50 transition-colors cursor-pointer text-xs"
                    >
                      Yêu cầu sửa đổi
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductState('approved')}
                      className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:bg-emerald-600 transition-colors cursor-pointer border-0 text-xs"
                    >
                      Xác nhận nhận hàng
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 resize-none h-24"
                      placeholder="Nhập lý do cần chỉnh sửa..."
                      value={revisionText}
                      onChange={(e) => setRevisionText(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowRevisionInput(false)}
                        className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border-0 text-xs"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductState('revision')}
                        disabled={!revisionText.trim()}
                        className="flex-1 py-2 bg-amber-500 text-white font-bold rounded-lg shadow-md hover:bg-amber-600 transition-colors cursor-pointer border-0 text-xs disabled:opacity-50"
                      >
                        Gửi yêu cầu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Trạng thái Approved */}
            {productState === 'approved' && (
              <div className="flex flex-col items-center justify-center text-center mt-auto p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-emerald-700 mb-1">Đã xác nhận thanh toán</h4>
                <p className="text-xs text-emerald-600/80">
                  Sản phẩm đã được nhận và thanh toán thành công cho Freelancer.
                </p>
              </div>
            )}

            {/* Trạng thái Revision */}
            {productState === 'revision' && (
              <div className="flex flex-col items-center justify-center text-center mt-auto p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-amber-700 mb-1">Đã gửi yêu cầu chỉnh sửa</h4>
                <p className="text-xs text-amber-600/80">
                  Yêu cầu đã được gửi. Vui lòng chờ Freelancer phản hồi.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setProductState('review');
                    setShowRevisionInput(false);
                    setRevisionText('');
                  }}
                  className="mt-4 text-xs text-amber-600 font-bold underline bg-transparent border-0 cursor-pointer"
                >
                  Hủy yêu cầu (Quay lại)
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default WorkspacePage;
