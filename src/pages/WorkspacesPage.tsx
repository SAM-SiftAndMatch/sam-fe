import type React from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import Header from '../components/Header';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  chatting: { label: 'Đang trao đổi', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  in_progress: {
    label: 'Đang thực hiện',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  completed: { label: 'Hoàn thành', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
};

const WorkspacesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const passedRole = location.state?.role;
    const savedRole = localStorage.getItem('SAM_ROLE');
    const currentRole =
      passedRole === 'freelancer' || savedRole === 'freelancer' ? 'freelancer' : 'client';

    setRole(currentRole);
    localStorage.setItem('SAM_ROLE', currentRole);

    // Load workspaces from SAM_WORKSPACES
    const savedWorkspaces = JSON.parse(localStorage.getItem('SAM_WORKSPACES') || '[]');
    // Sort by most recent first
    savedWorkspaces.sort(
      (a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    setWorkspaces(savedWorkspaces);
  }, [location.state]);

  const getStatusInfo = (status: string) => STATUS_LABELS[status] || STATUS_LABELS.chatting;

  const filteredWorkspaces = workspaces.filter((workspace) => {
    const searchLower = searchQuery.toLowerCase();
    const projectName = workspace.projectName || '';
    const freelancerName = workspace.freelancerName || '';
    return (
      projectName.toLowerCase().includes(searchLower) ||
      freelancerName.toLowerCase().includes(searchLower)
    );
  });
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {role === 'client' ? <ClientDashboardHeader /> : <Header />}

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              Tin nhắn & Không gian làm việc
            </h1>
            <p className="text-gray-500">
              Quản lý các cuộc trao đổi với {role === 'client' ? 'Freelancer' : 'Khách hàng'} của
              bạn.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6 relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên dự án hoặc người nhắn..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all shadow-sm"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {workspaces.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có tin nhắn nào</h3>
              <p className="text-gray-500 text-sm">
                Bạn chưa có cuộc trò chuyện nào với{' '}
                {role === 'client' ? 'freelancer' : 'khách hàng'}.
              </p>
            </div>
          ) : filteredWorkspaces.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-500 text-sm">
                Không có cuộc trò chuyện nào phù hợp với từ khóa "{searchQuery}".
              </p>
            </div>
          ) : (
            filteredWorkspaces.map((workspace) => {
              const statusInfo = getStatusInfo(workspace.status);
              return (
                <div
                  key={workspace.id}
                  onClick={() =>
                    navigate(`/workspace/${workspace.projectId}`, {
                      state: {
                        role,
                        freelancer: {
                          id: workspace.freelancerId,
                          name: workspace.freelancerName,
                          avatar: workspace.freelancerAvatar,
                        },
                        project: {
                          id: workspace.projectId,
                          title: workspace.projectName,
                          status: workspace.status,
                        },
                      },
                    })
                  }
                  className="flex items-start gap-4 p-5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
                >
                  <div className="relative">
                    <img
                      src={workspace.freelancerAvatar}
                      alt={workspace.freelancerName}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    {workspace.status === 'in_progress' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Row 1: Project name + time */}
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-[15px] font-bold text-gray-900 truncate pr-4">
                        {workspace.projectName}
                      </h3>
                      <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                        {workspace.lastMessageTime}
                      </span>
                    </div>

                    {/* Row 2: Freelancer name + status badge */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm text-gray-500 truncate">
                        với {workspace.freelancerName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Row 3: Last message + unread count */}
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-sm truncate ${workspace.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-600'}`}
                      >
                        {workspace.lastMessage}
                      </p>
                      {workspace.unreadCount > 0 && (
                        <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {workspace.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkspacesPage;
