import type React from 'react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionApi } from '../api/subscription';
import Footer from '../components/Footer';
import GuestHeader from '../components/GuestHeader';
import { InteractiveBackground } from '../components/landing/InteractiveBackground';
import { MonoTag } from '../components/landing/LandingButtons';
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden">
      <InteractiveBackground />
      <GuestHeader />

      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-16 flex flex-col items-center justify-center z-10">
        <div
          className={`w-full bg-white rounded-xl p-8 sm:p-10 border shadow-xs text-center ${
            success ? 'border-emerald-200' : 'border-rose-200'
          }`}
        >
          <div className="flex justify-center mb-4">
            <MonoTag variant={success ? 'primary' : 'muted'}>
              VNPAY {'//'} {success ? 'SUCCESS' : `CODE_${responseCode || 'ERROR'}`}
            </MonoTag>
          </div>

          <div
            className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-5 ${
              success ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {success ? (
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
            {success ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            {success
              ? 'VNPay đã ghi nhận giao dịch. Kích hoạt gói / vào ký quỹ khi IPN về, trạng thái tự cập nhật.'
              : `Mã phản hồi VNPay: ${responseCode || 'không xác định'}. Bạn có thể thử lại.`}
          </p>

          {amountVnd !== null && !Number.isNaN(amountVnd) && (
            <div className="mb-8 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs font-mono text-slate-500 block mb-0.5">
                SỐ TIỀN GIAO DỊCH
              </span>
              <p className="text-2xl font-bold font-mono text-[#1D4ED8]">
                {new Intl.NumberFormat('vi-VN').format(amountVnd)} VND
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleBack}
            className="group relative w-full h-[44px] bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg border-t border-t-blue-400/30 transition-all duration-200 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] btn-sweep"
          >
            <span>Về trang thanh toán</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VnpayReturnPage;
