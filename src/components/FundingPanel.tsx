import axios from 'axios';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { paymentApi } from '../api/payment';
import { usePaymentNotifications } from '../features/payment';
import { useAuthStore } from '../stores/useAuthStore';
import type { AmountVerification, FundingStatus } from '../types/payment';
import { formatMoney } from '../utils/format';

interface FundingPanelProps {
  roomId: string;
  contractId: string;
}

const paidBadge = (paid: boolean) =>
  paid ? (
    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
      ✓ Đã chuyển
    </span>
  ) : (
    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200">
      ○ Chưa chuyển
    </span>
  );

/**
 * Nạp tiền khởi động: client 100% + freelancer cọc 2%. Đủ cả hai mới cho dự án chạy.
 * Cuối dự án freelancer nhận 90%, sàn giữ 10%, cọc 2% hoàn trả khi xong.
 */
const FundingPanel: React.FC<FundingPanelProps> = ({ roomId, contractId }) => {
  const { user } = useAuthStore();
  const role = user?.role === 'FREELANCER' ? 'freelancer' : 'client';
  const [funding, setFunding] = useState<FundingStatus | null>(null);
  const [verify, setVerify] = useState<AmountVerification | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [paying, setPaying] = useState<'fund' | 'deposit' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFunding = useCallback(async () => {
    try {
      setFunding(await paymentApi.getFundingStatus(contractId));
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { message?: string } | undefined;
        setError(data?.message || 'Không tải được bảng nạp tiền');
      } else {
        setError('Không tải được bảng nạp tiền');
      }
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void loadFunding();
  }, [loadFunding]);

  // Tự đối chiếu AI 1 lần khi mở để biết số có khớp không
  useEffect(() => {
    let cancelled = false;
    setVerifying(true);
    paymentApi
      .verifyAmount(contractId)
      .then((v) => {
        if (!cancelled) setVerify(v);
      })
      .catch(() => {
        if (!cancelled) setVerify({ matches: false, note: 'Không kiểm chứng được, thử lại.' });
      })
      .finally(() => {
        if (!cancelled) setVerifying(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contractId]);

  // IPN / mở dự án đẩy WS → tải lại ngay
  usePaymentNotifications(contractId, () => {
    void loadFunding();
  });

  const verifiedOk = verify?.matches === true;

  const handlePay = async (kind: 'fund' | 'deposit') => {
    if (!verifiedOk) {
      setError('AI đối chiếu lệch số — sửa lại hợp đồng cho khớp rồi mới chuyển tiền.');
      return;
    }
    setPaying(kind);
    setError(null);
    try {
      const returnUrl = `${window.location.origin}/workspace/${roomId}/contract`;
      const created =
        kind === 'fund'
          ? await paymentApi.createFund({ contractId, returnUrl })
          : await paymentApi.createDeposit({ contractId, returnUrl });
      if (!created.vnpayUrl) {
        setError('Không tạo được link thanh toán VNPay');
        return;
      }
      // Ghi nhớ để khi VNPay redirect về thì FE tự gọi confirm (giống mua gói)
      try {
        localStorage.setItem(
          'SAM_PENDING_FUNDING',
          JSON.stringify({ paymentId: created.paymentId, contractId, roomId, kind })
        );
      } catch {
        // bỏ qua lỗi quota
      }
      window.location.href = created.vnpayUrl;
    } catch (e) {
      // Khoản có rồi (bấm Nạp 2 lần / quay lại sau khi chưa trả xong): tải lại bảng cho đúng
      void loadFunding();
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { message?: string } | undefined;
        setError(data?.message || 'Tạo thanh toán thất bại');
      } else {
        setError('Tạo thanh toán thất bại');
      }
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] overflow-hidden">
      <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-gray-900">💰 Nạp tiền khởi động</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Đủ tiền 2 bên mới cho dự án chạy — cuối dự án freelancer nhận 90%, sàn giữ 10%
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadFunding()}
          className="text-xs font-bold text-[#1D4ED8] hover:underline bg-transparent border-0 cursor-pointer shrink-0"
        >
          Tải lại
        </button>
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-4">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">Đang tải bảng nạp tiền...</p>
        ) : !funding ? (
          <p className="text-sm text-gray-400 text-center py-4">Không tải được bảng nạp tiền.</p>
        ) : (
          <>
            {/* Đối chiếu AI */}
            <div
              className={`rounded-2xl p-4 border flex items-center gap-3 ${
                verifying
                  ? 'bg-gray-50 border-gray-200'
                  : verifiedOk
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
              }`}
            >
              <span className="text-xl">{verifying ? '🔍' : verifiedOk ? '✅' : '⛔'}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">
                  {verifying
                    ? 'AI đang đọc hợp đồng để đối chiếu số tiền...'
                    : verifiedOk
                      ? `AI xác nhận: số trong văn bản khớp giá thỏa thuận (${formatMoney(Number(verify?.extractedAmount))} đ)`
                      : 'AI đối chiếu lệch số — chưa cho chuyển tiền'}
                </p>
                {!verifying && !verifiedOk && verify?.note && (
                  <p className="text-xs text-red-600 mt-1">{verify.note}</p>
                )}
                {!verifying && !verifiedOk && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Hai bên sửa lại hợp đồng cho khớp số rồi bấm Tải lại trang.
                  </p>
                )}
              </div>
            </div>

            {/* Client nạp 100% */}
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Bên A — Client nạp 100%
                </p>
                <p className="text-xl font-black text-[#1D4ED8]">
                  {formatMoney(Number(funding.clientAmount))} đ
                </p>
                <div className="mt-2">{paidBadge(funding.fundPaid)}</div>
              </div>
              {role === 'client' && !funding.fundPaid && (
                <button
                  type="button"
                  onClick={() => void handlePay('fund')}
                  disabled={paying !== null || !verifiedOk}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity cursor-pointer border-0 disabled:opacity-50"
                >
                  {paying === 'fund' ? 'Đang tạo link...' : 'Nạp qua VNPay'}
                </button>
              )}
            </div>

            {/* Freelancer cọc 2% */}
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Bên B — Freelancer cọc cam kết 2%
                </p>
                <p className="text-xl font-black text-gray-900">
                  {formatMoney(Number(funding.depositAmount))} đ
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Xong việc đúng hạn được hoàn trả, bỏ job thì đền cho client
                </p>
                <div className="mt-2">{paidBadge(funding.depositPaid)}</div>
              </div>
              {role === 'freelancer' && !funding.depositPaid && (
                <button
                  type="button"
                  onClick={() => void handlePay('deposit')}
                  disabled={paying !== null || !verifiedOk}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer border-0 disabled:opacity-50"
                >
                  {paying === 'deposit' ? 'Đang tạo link...' : 'Đặt cọc qua VNPay'}
                </button>
              )}
            </div>

            {/* Dự kiến cuối dự án */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-gray-900 to-gray-700 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">
                Cuối dự án (thanh toán 1 lần duy nhất)
              </p>
              <div className="flex flex-col sm:flex-row gap-3 text-sm">
                <span className="font-bold">
                  Freelancer nhận 90%: {formatMoney(Number(funding.freelancerPayout))} đ
                </span>
                <span className="text-white/60 font-semibold">
                  Phí sàn 10%: {formatMoney(Number(funding.platformFee))} đ
                </span>
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {funding.allPaid || funding.jobStatus === 'IN_PROGRESS' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                <p className="text-sm font-bold text-emerald-700">
                  🎉 Đã nạp đủ tiền 2 bên — dự án chính thức bắt đầu!
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center">
                {funding.fundPaid || funding.depositPaid
                  ? 'Còn 1 bên chưa chuyển — chờ nốt rồi hệ thống tự mở dự án.'
                  : 'Cả 2 bên chuyển xong hệ thống tự chuyển dự án sang thực hiện.'}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FundingPanel;
