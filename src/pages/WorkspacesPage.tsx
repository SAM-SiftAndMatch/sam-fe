import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Header from '../components/Header';
import Footer from '../components/Footer';

// === MOCK DATA ===
const WORKSPACES = [
  {
    id: '1',
    projectId: '1',
    projectName: 'Phát triển module thanh toán VNPay cho Website Next.js',
    freelancerName: 'Nguyễn Văn A',
    freelancerAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    lastMessage: 'Vâng, tôi đã nhận được thông tin API key.',
    lastMessageTime: '10 phút trước',
    unreadCount: 2,
    status: 'in_progress',
  },
  {
    id: '2',
    projectId: '2',
    projectName: 'Dịch thuật bộ hợp đồng thương mại Việt - Anh',
    freelancerName: 'Trần Thị B',
    freelancerAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    lastMessage: 'Tôi sẽ gửi bản nháp vào chiều nay nhé.',
    lastMessageTime: '2 giờ trước',
    unreadCount: 0,
    status: 'in_progress',
  },
  {
    id: '3',
    projectId: '3',
    projectName: 'Thiết kế logo và bộ nhận diện thương hiệu quán Cafe',
    freelancerName: 'Lê Văn C',
    freelancerAvatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    lastMessage: 'Cảm ơn bạn đã tin tưởng!',
    lastMessageTime: '1 ngày trước',
    unreadCount: 0,
    status: 'completed',
  },
];

const WorkspacesPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'client' | 'freelancer'>('client');

  useEffect(() => {
    const savedRole = localStorage.getItem('SAM_ROLE');
    if (savedRole === 'freelancer') {
      setRole('freelancer');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {role === 'client' ? <ClientDashboardHeader /> : <Header />}

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Tin nhắn & Không gian làm việc</h1>
            <p className="text-gray-500">Quản lý các cuộc trao đổi với Freelancer của bạn.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">
              Tất cả
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">
              Chưa đọc
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {WORKSPACES.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => navigate(`/workspace/${workspace.projectId}`)}
              className="flex items-start gap-4 p-5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
            >
              <div className="relative">
                <img
                  src={workspace.freelancerAvatar}
                  alt={workspace.freelancerName}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                {workspace.status === 'in_progress' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-base font-bold text-gray-900 truncate pr-4">
                    {workspace.freelancerName}
                  </h3>
                  <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                    {workspace.lastMessageTime}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-1 text-sm text-gray-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="truncate">{workspace.projectName}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className={`text-sm truncate ${workspace.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
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
          ))}
          
          {WORKSPACES.length === 0 && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có tin nhắn nào</h3>
              <p className="text-gray-500 text-sm">Bạn chưa có cuộc trò chuyện nào với freelancer.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkspacesPage;
