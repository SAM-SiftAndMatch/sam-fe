import { Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { primaryClass, secondaryClass } from '../components/finance/FinanceUI';

/** The legacy URL also receives Pay2S redirects. Query parameters never confirm money. */
export default function VnpayReturnPage() {
  const navigate = useNavigate();
  const back = () => {
    const pending = sessionStorage.getItem('sam:payment-return');
    sessionStorage.removeItem('sam:payment-return');
    if (pending && /^\/workspace\/[0-9a-fA-F-]{36}(\/contract)?$/.test(pending))
      navigate(pending, { replace: true });
    else navigate('/workspaces', { replace: true });
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-lg px-5 py-20">
        <section className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <Clock3 className="mx-auto mb-5 text-blue-700" size={40} />
          <h1 className="text-2xl font-bold text-slate-900">Đang đối chiếu thanh toán</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Kết quả được xác nhận trực tiếp giữa nhà cung cấp và SAM. Bạn có thể quay lại dự án để
            xem trạng thái mới nhất; không cần thanh toán lại khi đang chờ xác nhận.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" className={primaryClass} onClick={back}>
              Quay lại dự án
            </button>
            <button
              type="button"
              className={secondaryClass}
              onClick={() => navigate('/workspaces', { replace: true })}
            >
              Tất cả hội thoại
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
