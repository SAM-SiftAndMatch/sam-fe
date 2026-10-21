import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { jobApi } from '../api/job';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import { PATH_CLIENT_PROJECT_DETAIL, PATH_CLIENT_SUCCESS_PROJECT } from '../routes/paths';

export default function JobAddonReturnPage() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmError, setConfirmError] = useState(false);
  const signedReturn =
    params.get('vnp_ResponseCode') === '00' &&
    params.get('vnp_TransactionStatus') === '00' &&
    Boolean(params.get('vnp_SecureHash'));
  const returnParams = params.toString();
  const addon = useQuery({
    queryKey: ['job-addons', id],
    queryFn: () => jobApi.getAddonSummary(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => (query.state.data?.orderStatus === 'PENDING' ? 2000 : false),
  });
  const serverPaid = addon.data?.orderStatus === 'PAID';
  useEffect(() => {
    if (!id || !signedReturn) return;
    let active = true;
    const vnpayParams = Object.fromEntries(
      Array.from(new URLSearchParams(returnParams).entries()).filter(([key]) =>
        key.startsWith('vnp_')
      )
    );
    void jobApi
      .confirmAddonReturn(id, vnpayParams)
      .then((summary) => {
        if (!active) return;
        setConfirmError(false);
        queryClient.setQueryData(['job-addons', id], summary);
        void queryClient.invalidateQueries({ queryKey: ['job-addons', id] });
        void queryClient.invalidateQueries({ queryKey: ['client-dashboard-overview'] });
        void queryClient.invalidateQueries({ queryKey: ['jobs'] });
      })
      .catch(() => {
        if (active) setConfirmError(true);
      });
    return () => {
      active = false;
    };
  }, [id, signedReturn, returnParams, queryClient]);
  useEffect(() => {
    if (!serverPaid || !id) return;
    let cancelled = false;
    void jobApi.getJobById(id).then((jobData) => {
      if (!cancelled) {
        navigate(`${PATH_CLIENT_SUCCESS_PROJECT}?jobId=${id}`, {
          replace: true,
          state: { newProjectId: id, jobData, paymentConfirmed: true },
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [serverPaid, id, navigate]);

  const failedRedirect =
    params.get('vnp_ResponseCode') !== null && params.get('vnp_ResponseCode') !== '00';
  const needsReview = addon.data?.orderStatus === 'PAID_UNAPPLIED';

  return (
    <div className="client-route flex min-h-screen flex-col bg-[#F8FAFC]">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-12">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            {needsReview
              ? 'Thanh toán cần được hỗ trợ'
              : failedRedirect
                ? 'Chưa thanh toán tính năng'
                : 'Đang xác nhận thanh toán'}
          </h1>
          <p className="mt-4 text-sm text-gray-600">
            {needsReview
              ? 'Đã ghi nhận khoản thanh toán nhưng dự án không còn tuyển. Vui lòng liên hệ hỗ trợ để xử lý.'
              : failedRedirect
                ? 'Dự án đã được đăng bình thường. Bạn có thể thanh toán lại tính năng tại trang chi tiết dự án.'
                : 'Dự án đã được đăng. Hệ thống đang chờ xác nhận giao dịch từ VNPay; tính năng chưa kích hoạt cho đến khi backend xác nhận.'}
          </p>
          {addon.isError && (
            <p className="mt-3 text-sm text-red-700">
              Chưa tải được trạng thái thanh toán. Vui lòng thử lại.
            </p>
          )}
          {confirmError && !serverPaid && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              Chưa xác minh được giao dịch từ đường dẫn VNPay. Hệ thống vẫn đang chờ IPN; vui lòng
              kiểm tra lại sau hoặc liên hệ hỗ trợ nếu đã bị trừ tiền.
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate(PATH_CLIENT_PROJECT_DETAIL.replace(':id', id ?? ''))}
            className="mt-6 h-11 cursor-pointer rounded-lg bg-blue-700 px-6 font-semibold text-white hover:bg-blue-800"
          >
            Xem dự án
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
