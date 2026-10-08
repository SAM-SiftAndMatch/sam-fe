import axios from 'axios';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chatApi } from '../api/chat';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import FundingPanel from '../components/FundingPanel';
import { PATH_CLIENT_PROJECTS } from '../routes/paths';

const ClientPaymentPage: React.FC = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!contractId) return;
    chatApi
      .getRoomByContract(contractId)
      .then((r) => setRoomId(r.id))
      .catch((e) => {
        if (axios.isAxiosError(e)) {
          const data = e.response?.data as { message?: string } | undefined;
          setServerError(data?.message || 'Không tìm thấy phòng chat của hợp đồng');
        } else {
          setServerError('Không tìm thấy phòng chat của hợp đồng');
        }
      });
  }, [contractId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <ClientDashboardHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
        <button
          type="button"
          onClick={() => navigate(PATH_CLIENT_PROJECTS)}
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

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nạp tiền & Giao việc</h1>
          <p className="text-gray-500 text-sm">
            Client nạp 100% giá trị hợp đồng, freelancer cọc 2% cam kết. Đủ tiền 2 bên hệ thống mới
            cho dự án chạy — cuối dự án freelancer nhận 90%, sàn giữ 10%.
          </p>
        </div>

        {serverError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {serverError}
          </div>
        )}

        {!contractId ? (
          <p className="text-sm text-gray-500">Thiếu mã hợp đồng trong đường dẫn.</p>
        ) : !roomId ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : (
          <FundingPanel roomId={roomId} contractId={contractId} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ClientPaymentPage;
