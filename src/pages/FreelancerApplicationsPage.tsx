import { useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { proposalApi } from '../api/proposal';
import AppHeader from '../components/AppHeader';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Footer from '../components/Footer';
import PaginationNav from '../components/PaginationNav';
import ProposalStatusBadge from '../components/ProposalStatusBadge';
import { usePageSearchParam } from '../hooks/usePageSearchParam';
import { extractApiResponse } from '../lib/api-error';
import * as paths from '../routes/paths';
import type { ProposalResponse } from '../types/proposal';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'PENDING', label: 'Đang chờ' },
  { id: 'INVITED', label: 'Được mời' },
  { id: 'ACCEPTED', label: 'Đã nhận việc' },
  { id: 'REJECTED', label: 'Từ chối' },
];

const FreelancerApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [page, setPage] = usePageSearchParam();
  const [withdrawTarget, setWithdrawTarget] = useState<ProposalResponse | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const { data: proposalPage, isLoading } = useQuery({
    queryKey: ['my-proposals-page', page, activeTab],
    queryFn: () =>
      proposalApi.getMinePage({
        page,
        size: 10,
        status: activeTab === 'all' ? undefined : activeTab,
      }),
  });

  const handleWithdraw = async () => {
    if (!withdrawTarget || withdrawing) return;
    setWithdrawing(true);
    try {
      await proposalApi.withdraw(withdrawTarget.id);
      toast.success('Đã rút hồ sơ ứng tuyển.');
      await queryClient.invalidateQueries({ queryKey: ['my-proposals-page'] });
      await queryClient.invalidateQueries({ queryKey: ['my-proposal', withdrawTarget.jobId] });
      setWithdrawTarget(null);
    } catch (err) {
      toast.error(extractApiResponse(err)?.message || 'Không rút được hồ sơ ứng tuyển.');
    } finally {
      setWithdrawing(false);
    }
  };

  const filteredApps = proposalPage?.items ?? [];

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatMoney = (n: number) => `${new Intl.NumberFormat('vi-VN').format(n)}đ`;

  return (
    <div className="freelancer-route min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <AppHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Hồ sơ ứng tuyển</h1>
            <p className="text-gray-500">
              Quản lý và theo dõi trạng thái các công việc bạn đã gửi hồ sơ
            </p>
          </div>

          {/* Tabs / Filter */}
          <div className="w-full md:w-56 shrink-0">
            <select
              value={activeTab}
              onChange={(e) => {
                setActiveTab(e.target.value);
                setPage(0);
              }}
              aria-label="Lọc trạng thái hồ sơ"
              className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-full text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all shadow-sm cursor-pointer"
            >
              {TABS.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <p className="text-sm text-gray-500 text-center py-10">Đang tải hồ sơ...</p>
          ) : filteredApps.length === 0 ? (
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
            filteredApps.map((app: ProposalResponse) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Cột trái */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <ProposalStatusBadge status={app.status} audience="freelancer" />
                      <span className="text-xs font-semibold text-gray-400">
                        Nộp ngày {formatDate(app.createdAt)}
                      </span>
                    </div>
                    <h2
                      onClick={() => navigate(paths.PATH_JOB_DETAIL.replace(':id', app.jobId))}
                      className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-[#1D4ED8]"
                    >
                      {app.jobTitle}
                    </h2>
                    <div className="text-sm font-bold text-[#1D4ED8]">
                      Đề xuất: {formatMoney(Number(app.proposedBudget))}
                    </div>
                  </div>

                  {/* Cột phải */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {app.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => setWithdrawTarget(app)}
                        className="flex-1 md:flex-none bg-white hover:bg-red-50 text-red-600 font-bold py-2.5 px-5 rounded-xl border border-red-200 cursor-pointer"
                      >
                        Rút hồ sơ
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate(paths.PATH_JOB_DETAIL.replace(':id', app.jobId))}
                      className="flex-1 md:flex-none bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-6 rounded-xl border border-gray-200 cursor-pointer"
                    >
                      {app.status === 'INVITED' ? 'Xem lời mời' : 'Xem dự án'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <PaginationNav
          page={page + 1}
          totalPages={proposalPage?.totalPages ?? 0}
          onPageChange={(nextPage) => setPage(nextPage - 1)}
          label="Phân trang hồ sơ ứng tuyển"
          className="mt-5"
        />
      </main>

      <Footer />

      <ConfirmDeleteModal
        isOpen={withdrawTarget !== null}
        title="Rút hồ sơ ứng tuyển"
        message={`Bạn có chắc chắn muốn rút hồ sơ đã nộp cho dự án “${withdrawTarget?.jobTitle ?? ''}”?`}
        confirmText={withdrawing ? 'Đang rút...' : 'Rút hồ sơ'}
        cancelText="Giữ lại"
        isPending={withdrawing}
        onConfirm={() => void handleWithdraw()}
        onCancel={() => !withdrawing && setWithdrawTarget(null)}
      />
    </div>
  );
};

export default FreelancerApplicationsPage;
