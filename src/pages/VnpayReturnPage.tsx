import type React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import GuestHeader from '../components/GuestHeader';
import { PATH_CLIENT_PAYMENT } from '../routes/paths';

const PENDING_CONTRACT_KEY = 'SAM_PENDING_CONTRACT';

/**
 * Hứng redirect từ VNPay sau thanh toán. Chỉ HIỂN THỊ kết quả từ query,
 * không tự kết luận — trạng thái thật do IPN + WS cập nhật ở trang thanh toán.
 */
const VnpayReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const responseCode = searchParams.get('vnp_ResponseCode');
  const amountParam = searchParams.get('vnp_Amount');
  const success = responseCode === '00';
  const amountVnd = amountParam ? Number.parseInt(amountParam, 10) / 100 : null;

  const handleBack = () => {
    const contractId = localStorage.getItem(PENDING_CONTRACT_KEY);
    localStorage.removeItem(PENDING_CONTRACT_KEY);
    if (contractId) {
      navigate(PATH_CLIENT_PAYMENT.replace(':contractId', contractId));
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
              ? 'VNPay đã ghi nhận giao dịch. Trạng thái ký quỹ sẽ tự cập nhật trong giây lát.'
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
