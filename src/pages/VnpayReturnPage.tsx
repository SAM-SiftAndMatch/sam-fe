import type React from 'react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionApi } from '../api/subscription';
import Footer from '../components/Footer';
import GuestHeader from '../components/GuestHeader';
import { PATH_CLIENT_PAYMENT, PATH_CLIENT_PROFILE } from '../routes/paths';

const PENDING_CONTRACT_KEY = 'SAM_PENDING_CONTRACT';
const PENDING_SUBSCRIPTION_KEY = 'SAM_PENDING_SUBSCRIPTION';

/**
 * Hứng redirect từ VNPay sau thanh toán (ký quỹ Escrow hoặc mua gói).
 * Chỉ HIỂN THỊ kết quả từ query, không tự kết luận — trạng thái thật do IPN + WS cập nhật.
 */
const VnpayReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const responseCode = searchParams.get('vnp_ResponseCode');
  const amountParam = searchParams.get('vnp_Amount');
  const success = responseCode === '00';
  const amountVnd = amountParam ? Number.parseInt(amountParam, 10) / 100 : null;

  // Auto-confirm subscription if payment successful
  useEffect(() => {
    if (success) {
      const subscriptionId = localStorage.getItem(PENDING_SUBSCRIPTION_KEY);
      if (subscriptionId) {
        subscriptionApi
          .confirmPayment(subscriptionId)
          .then(() => {
            // Subscription activated successfully
          })
          .catch((e) => {
            console.error('Failed to confirm subscription:', e);
            // Still show success page even if confirm fails
          });
      }
    }
  }, [success]);

  const handleBack = () => {
    const contractId = localStorage.getItem(PENDING_CONTRACT_KEY);
    const hasSubscription = localStorage.getItem(PENDING_SUBSCRIPTION_KEY);
    localStorage.removeItem(PENDING_CONTRACT_KEY);
    localStorage.removeItem(PENDING_SUBSCRIPTION_KEY);
    if (contractId) {
      navigate(PATH_CLIENT_PAYMENT.replace(':contractId', contractId));
    } else if (hasSubscription) {
      navigate(PATH_CLIENT_PROFILE);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <GuestHeader />
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-16 flex flex-col items-center">
        <div
          className={`w-full bg-white rounded-3xl p-8 border text-center ${
            success ? 'border-green-200' : 'border-red-200'
          }`}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {success ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất'}
          </h1>
          <p className="text-sm text-gray-500 mb-2">
            {success
              ? 'VNPay đã ghi nhận giao dịch. Kích hoạt gói / vào ký quỹ khi IPN về, trạng thái tự cập nhật.'
              : `Mã phản hồi VNPay: ${responseCode || 'không xác định'}. Bạn có thể thử lại.`}
          </p>
          {amountVnd !== null && !Number.isNaN(amountVnd) && (
            <p className="text-lg font-black text-[#1D4ED8] mb-6">
              {new Intl.NumberFormat('vi-VN').format(amountVnd)} VND
            </p>
          )}
          <button
            type="button"
            onClick={handleBack}
            className="w-full bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold py-3.5 rounded-2xl cursor-pointer border-0"
          >
            Về trang thanh toán
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VnpayReturnPage;
