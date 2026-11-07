import { useQuery } from '@tanstack/react-query';
import { Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { financeApi } from '../../api/finance';
import { PATH_FREELANCER_EARNINGS } from '../../routes/paths';
import { useAuthStore } from '../../stores/useAuthStore';
import { secondaryClass } from './FinanceUI';

export default function BankSetupNotice() {
  const user = useAuthStore((s) => s.user);
  const setup = useQuery({
    queryKey: ['finance', user?.userId, 'bank-setup'],
    queryFn: financeApi.bankSetup,
    enabled: user?.role === 'FREELANCER',
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  });
  if (user?.role !== 'FREELANCER' || setup.isPending || setup.data?.status === 'READY') return null;
  if (setup.isError)
    return (
      <div
        aria-live="polite"
        className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600"
      >
        Chưa kiểm tra được tài khoản nhận tiền.{' '}
        <button type="button" className="underline" onClick={() => void setup.refetch()}>
          Thử lại
        </button>
      </div>
    );
  const pending = setup.data?.status === 'PENDING';
  return (
    <div
      aria-live="polite"
      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${pending ? 'border-blue-100 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}
    >
      <div className="flex items-start gap-3">
        <Landmark className="mt-0.5 shrink-0" size={22} />
        <div>
          <p className="font-semibold text-slate-900">
            {pending
              ? 'Tài khoản ngân hàng đang chờ xác minh'
              : 'Bổ sung tài khoản ngân hàng để nhận thanh toán'}
          </p>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            {pending
              ? 'Bạn đã gửi thông tin. SAM sẽ xác minh trước khi tài khoản được dùng để rút tiền.'
              : 'Bạn chưa có tài khoản nhận tiền hợp lệ. Thêm tài khoản chính chủ để SAM xác minh và chuẩn bị chi trả thu nhập của bạn.'}
          </p>
        </div>
      </div>
      <Link
        className={secondaryClass}
        to={`${PATH_FREELANCER_EARNINGS}?tab=banks${pending ? '' : '&action=add-bank'}`}
      >
        {pending ? 'Xem tài khoản' : 'Cập nhật ngân hàng'}
      </Link>
    </div>
  );
}
