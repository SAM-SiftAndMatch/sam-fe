import { useNavigate } from 'react-router-dom';
import type { UserSubscriptionResponse } from '../../../types/subscription';
import { useMySubscriptions } from '../hooks/useSubscriptions';
import { PACKAGE_META } from '../packages';

const STATUS_TEXT: Record<string, { text: string; className: string }> = {
  ACTIVE: { text: 'Đang dùng', className: 'bg-green-50 text-green-700 border-green-100' },
  PENDING: { text: 'Chờ thanh toán', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  EXPIRED: { text: 'Hết hạn', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  CANCELLED: { text: 'Đã hủy', className: 'bg-red-50 text-red-500 border-red-100' },
};

const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return 'Không giới hạn ngày';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('vi-VN');
};

function PackageRow({ sub }: { sub: UserSubscriptionResponse }) {
  const meta = PACKAGE_META[sub.packageId];
  const badge = STATUS_TEXT[sub.status] || STATUS_TEXT.ACTIVE;
  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div>
        <div className="font-bold text-sm text-gray-900">{meta?.name || 'Gói dịch vụ'}</div>
        <div className="text-xs text-gray-500">
          {meta?.price || ''} · Hạn dùng: {formatDateTime(sub.endDate)}
          {sub.targetProjectId
            ? ` · Dự án SAM-${sub.targetProjectId.slice(0, 8).toUpperCase()}`
            : ''}
        </div>
      </div>
      <span
        className={`text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 ${badge.className}`}
      >
        {badge.text}
      </span>
    </div>
  );
}

/**
 * Section "Gói của tôi" dùng chung cho trang Hồ sơ (client + freelancer):
 * gói tháng (hạn dùng) và gói lẻ (theo từng project).
 */
export function MyPackagesSection({ pricingPath }: { pricingPath: string }) {
  const navigate = useNavigate();
  const { subscriptions, isLoading } = useMySubscriptions();

  const monthly = subscriptions.filter((s) => s.endDate !== null || s.status !== 'ACTIVE');
  const single = subscriptions.filter((s) => s.endDate === null && s.status === 'ACTIVE');

  return (
    <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-gray-900">Gói của tôi</h2>
        <button
          type="button"
          onClick={() => navigate(pricingPath)}
          className="text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0"
        >
          Mua thêm gói
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Gói tháng tính hạn dùng 30 ngày · Gói lẻ theo vòng đời từng dự án, không giới hạn ngày.
      </p>
      {isLoading ? (
        <p className="text-sm text-gray-500">Đang tải gói...</p>
      ) : subscriptions.length === 0 ? (
        <p className="text-sm text-gray-500">
          Bạn chưa mua gói nào. Bấm "Mua thêm gói" để xem bảng giá.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {monthly.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Gói tháng
              </h3>
              {monthly.map((s) => (
                <PackageRow key={s.id} sub={s} />
              ))}
            </div>
          )}
          {single.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Gói lẻ theo dự án
              </h3>
              {single.map((s) => (
                <PackageRow key={s.id} sub={s} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyPackagesSection;
