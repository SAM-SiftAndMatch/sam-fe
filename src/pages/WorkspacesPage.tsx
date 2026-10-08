import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../api/chat';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useAuthStore } from '../stores/useAuthStore';

const WorkspacesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role === 'FREELANCER' ? 'freelancer' : 'client';
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: rooms = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getMyRooms(),
  });

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (r) =>
        r.jobTitle.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.freelancerName.toLowerCase().includes(q)
    );
  }, [rooms, searchQuery]);

  const otherName = (room: (typeof rooms)[number]) =>
    role === 'client' ? room.freelancerName : room.clientName;

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
              {isLoading
                ? 'Đang tải...'
                : `${rooms.length} cuộc trò chuyện với ${role === 'client' ? 'freelancer' : 'khách hàng'} của bạn.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-bold text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
          >
            Tải lại
          </button>
        </div>

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
          {isLoading ? (
            <div className="p-10 text-center text-sm text-gray-500">Đang tải tin nhắn...</div>
          ) : isError ? (
            <div className="p-10 text-center">
              <p className="text-gray-700 font-semibold mb-2">Không tải được tin nhắn</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors border-0 cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : rooms.length === 0 ? (
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
                Khi bạn và {role === 'client' ? 'freelancer' : 'khách hàng'} đồng ý bắt tay 1 chạm,
                phòng chat sẽ hiện ở đây.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-500 text-sm">
                Không có cuộc trò chuyện nào phù hợp với từ khóa "{searchQuery}".
              </p>
            </div>
          ) : (
            filtered.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate(`/workspace/${room.id}`)}
                className="flex items-start gap-4 p-5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center font-black text-lg border border-gray-200">
                    {otherName(room).charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[15px] font-bold text-gray-900 truncate pr-4">
                      {room.jobTitle}
                    </h3>
                    <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                      {room.lastMessageAt
                        ? new Date(room.lastMessageAt).toLocaleString('vi-VN')
                        : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm text-gray-500 truncate">với {otherName(room)}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 border-amber-200 text-amber-700">
                      Đang trao đổi
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm truncate text-gray-600">
                      {room.lastMessage || 'Chưa có tin nhắn — chào nhau đi!'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkspacesPage;
