import { usePaymentNotifications } from '@/features/payment';
import axios from 'axios';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { paymentApi } from '../api/payment';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { PATH_CLIENT_PROJECTS } from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';
import type { PaymentResponse } from '../types/payment';

const PENDING_CONTRACT_KEY = 'SAM_PENDING_CONTRACT';

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  PENDING: { text: 'Chờ thanh toán', className: 'bg-gray-100 text-gray-600' },
  HELD_IN_ESCROW: { text: 'Đang ký quỹ', className: 'bg-amber-50 text-amber-700' },
  RELEASED: { text: 'Đã giải ngân', className: 'bg-green-50 text-green-700' },
  REFUNDED: { text: 'Đã hoàn tiền', className: 'bg-red-50 text-red-700' },
};

const formatCurrency = (num: number) => `${new Intl.NumberFormat('vi-VN').format(num)} VND`;

const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('vi-VN');
};

const ClientPaymentPage: React.FC = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    if (!contractId) return;
    setIsLoading(true);
    setServerError(null);
    try {
      setPayments(await paymentApi.getByContract(contractId));
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { message?: string } | undefined;
        setServerError(data?.message || 'Không tải được giao dịch ký quỹ');
      } else {
        setServerError('Không tải được giao dịch ký quỹ');
      }
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  // IPN/release đẩy WS → refetch ngay, không polling.
  usePaymentNotifications(contractId, (n) => {
    if (n.type === 'PAYMENT_ESCROW_HELD') {
      setSuccessMessage('Tiền ký quỹ đã vào Escrow.');
    } else if (n.type === 'PAYMENT_RELEASED') {
      setSuccessMessage('Tiền ký quỹ đã được giải ngân.');
    }
    void loadPayments();
  });

  const unfinished = payments.find((p) => p.status === 'PENDING' || p.status === 'HELD_IN_ESCROW');
  const heldPayment = payments.find((p) => p.status === 'HELD_IN_ESCROW');

  const handleCreateEscrow = async () => {
    if (!contractId || !isAuthenticated) return;
    setIsProcessing(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      const created = await paymentApi.createEscrow({ contractId });
      if (!created.vnpayUrl) {
        setServerError('Không tạo được link thanh toán VNPay');
        return;
      }
      localStorage.setItem(PENDING_CONTRACT_KEY, contractId);
      window.location.href = created.vnpayUrl;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { message?: string } | undefined;
        setServerError(data?.message || 'Tạo ký quỹ thất bại');
      } else {
        setServerError('Tạo ký quỹ thất bại');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRelease = async () => {
    if (!heldPayment) return;
    setIsProcessing(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      await paymentApi.release(heldPayment.paymentId);
      setSuccessMessage('Giải ngân thành công.');
      await loadPayments();
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { message?: string } | undefined;
        setServerError(data?.message || 'Giải ngân thất bại');
      } else {
        setServerError('Giải ngân thất bại');
      }
    } finally {
      setIsProcessing(false);
    }
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-8 mt-4">
          {/* Left Column - Escrow Details */}
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán cọc & Giao việc</h1>
            <p className="text-gray-500 text-sm mb-6">
              Vui lòng kiểm tra lại thông tin giao dịch trước khi xác nhận. Số tiền của bạn sẽ được
              nền tảng bảo lưu (Escrow) và chỉ thanh toán cho Freelancer khi bạn nghiệm thu công
              việc.
            </p>

            {serverError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {serverError}
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl">
                {successMessage}
              </div>
            )}

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Lịch sử ký quỹ (mỗi đợt 50%)</h2>
                <button
                  type="button"
                  onClick={() => void loadPayments()}
                  disabled={isLoading}
                  className="text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0 disabled:opacity-60"
                >
                  Tải lại
                </button>
              </div>

              {isLoading ? (
                <p className="text-sm text-gray-500">Đang tải giao dịch...</p>
              ) : !contractId ? (
                <p className="text-sm text-gray-500">Thiếu mã hợp đồng trong đường dẫn.</p>
              ) : payments.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Chưa có đợt ký quỹ nào. Mỗi đợt cọc 50% giá trị hợp đồng đã ký.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {payments.map((p) => {
                    const badge = STATUS_LABEL[p.status] || STATUS_LABEL.PENDING;
                    return (
                      <div
                        key={p.paymentId}
                        className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Đợt{' '}
                            {p.installment === 'DEPOSIT' ? '1 (đặt cọc)' : '2 (thanh toán cuối)'}
                          </div>
                          <div className="font-bold text-gray-900">
                            {formatCurrency(p.amount)} {p.currency}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Giữ quỹ: {formatDateTime(p.escrowHeldAt)} · Giải ngân:{' '}
                            {formatDateTime(p.releasedAt)}
                          </div>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full ${badge.className}`}
                        >
                          {badge.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
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

          {/* Right Column - Actions */}
          <div>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Thao tác ký quỹ</h2>

              {unfinished?.status === 'HELD_IN_ESCROW' ? (
                <button
                  type="button"
                  onClick={() => void handleRelease()}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold py-4 rounded-2xl shadow-[0_4px_20px_rgba(29,78,216,0.3)] hover:opacity-90 transition-all flex justify-center items-center gap-2 cursor-pointer border-0 disabled:opacity-70"
                >
                  {isProcessing
                    ? 'Đang xử lý...'
                    : `Giải ngân ${formatCurrency(unfinished.amount)}`}
                </button>
              ) : unfinished?.status === 'PENDING' ? (
                <div className="text-sm text-gray-600 leading-relaxed">
                  Đã tạo đơn ký quỹ {formatCurrency(unfinished.amount)}, đang chờ thanh toán VNPay.
                  Sau khi thanh toán xong, trạng thái tự cập nhật tại đây.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleCreateEscrow()}
                  disabled={isProcessing || !contractId}
                  className="w-full bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold py-4 rounded-2xl shadow-[0_4px_20px_rgba(29,78,216,0.3)] hover:opacity-90 transition-all flex justify-center items-center gap-2 cursor-pointer border-0 disabled:opacity-70"
                >
                  {isProcessing
                    ? 'Đang xử lý...'
                    : payments.length === 0
                      ? 'Tạo ký quỹ 50% & Thanh toán VNPay'
                      : 'Tạo ký quỹ đợt tiếp theo'}
                </button>
              )}

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
