import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import * as paths from '../routes/paths';

type ApplicationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  price: string;
  status: ApplicationStatus;
  coverLetter: string;
  appliedAt: string;
}

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Đang chờ' },
  { id: 'draft', label: 'Nháp' },
  { id: 'approved', label: 'Đã duyệt' },
  { id: 'rejected', label: 'Từ chối' },
  { id: 'cancelled', label: 'Đã hủy' },
];

const FreelancerApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    // Load from LocalStorage
    const saved = JSON.parse(localStorage.getItem('SAM_FREELANCER_APPLICATIONS') || '[]');
    // Cung cấp 1 vài dữ liệu mock để UI đỡ trống nếu localStorage rỗng
    if (saved.length === 0) {
      const mockData: Application[] = [
        {
          id: 9991,
          jobId: 2,
          jobTitle: 'Dịch thuật bộ hợp đồng thương mại Việt - Anh (50 trang)',
          price: '3.500.000đ',
          status: 'pending',
          coverLetter: 'Tôi đã có kinh nghiệm dịch thuật...',
          appliedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 9992,
          jobId: 5,
          jobTitle: 'Bảo trì hệ thống Backend Microservices (Golang/Docker)',
          price: '30.000.000đ - 50.000.000đ',
          status: 'rejected',
          coverLetter: 'Tôi là Senior Backend...',
          appliedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ];
      setApplications(mockData);
      localStorage.setItem('SAM_FREELANCER_APPLICATIONS', JSON.stringify(mockData));
    } else {
      // Sort newest first
      setApplications(
        saved.sort(
          (a: Application, b: Application) =>
            new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        )
      );
    }
  }, []);

  const filteredApps = applications.filter(
    (app) => activeTab === 'all' || app.status === activeTab
  );

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            Đã duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
            Từ chối
          </span>
        );
      case 'draft':
        return (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
            Bản nháp
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
            Đang chờ
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Hồ sơ ứng tuyển</h1>
            <p className="text-gray-500">
              Quản lý và theo dõi trạng thái các công việc bạn đã gửi hồ sơ
            </p>
          </div>

          {/* Tabs / Filter */}
          <div className="relative w-full md:w-56 shrink-0">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-full text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all shadow-sm cursor-pointer"
            >
              {TABS.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredApps.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có hồ sơ nào</h3>
              <p className="text-gray-500 mb-6">Bạn chưa có đơn ứng tuyển nào ở trạng thái này.</p>
              <button
                onClick={() => navigate(paths.PATH_FREELANCER_JOBS)}
                className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-bold py-3 px-8 rounded-full transition-colors border-0 cursor-pointer"
              >
                Tìm việc ngay
              </button>
            </div>
          ) : (
            filteredApps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Cột trái */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusBadge(app.status)}
                      <span className="text-xs font-semibold text-gray-400">
                        Nộp ngày {formatDate(app.appliedAt)}
                      </span>
                    </div>
                    <h2
                      onClick={() =>
                        navigate(paths.PATH_JOB_DETAIL.replace(':id', app.jobId.toString()))
                      }
                      className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-[#1D4ED8] transition-colors"
                    >
                      {app.jobTitle}
                    </h2>
                    <div className="text-sm font-bold text-[#1D4ED8]">Ngân sách: {app.price}</div>
                  </div>

                  {/* Cột phải */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {app.status === 'draft' ? (
                      <button
                        onClick={() =>
                          navigate(paths.PATH_JOB_APPLY.replace(':id', app.jobId.toString()))
                        }
                        className="flex-1 md:flex-none bg-blue-50 hover:bg-blue-100 text-[#1D4ED8] font-bold py-2.5 px-6 rounded-xl transition-colors border-0 cursor-pointer"
                      >
                        Tiếp tục ứng tuyển
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          navigate(paths.PATH_JOB_DETAIL.replace(':id', app.jobId.toString()))
                        }
                        className="flex-1 md:flex-none bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-6 rounded-xl transition-colors border border-gray-200 cursor-pointer"
                      >
                        Xem dự án
                      </button>
                    )}
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

export default FreelancerApplicationsPage;
