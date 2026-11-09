import { ReceiptText } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RevenueEntry } from '../../api/admin';
import { money } from '../../api/finance';
import { adminDate } from './AdminUI';
import { sourceLabels } from './RevenueCharts';
export default function RevenueTable({ items }: { items: RevenueEntry[] }) {
  if (items.length === 0)
    return (
      <div className="px-5 py-14 text-center">
        <ReceiptText size={30} className="mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-medium text-slate-600">Chưa có doanh thu trong khoảng này</p>
        <p className="mt-1 text-xs text-slate-400">Thử thay đổi nguồn thu hoặc khoảng thời gian.</p>
      </div>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
            <th className="px-5 py-3 font-medium">Khoản thu / dự án</th>
            <th className="px-4 py-3 font-medium">Nguồn</th>
            <th className="px-4 py-3 font-medium">Khách hàng</th>
            <th className="px-4 py-3 font-medium">Ngày ghi nhận</th>
            <th className="px-5 py-3 text-right font-medium">Doanh thu</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/70">
              <td className="max-w-[330px] px-5 py-4">
                <p className="font-medium text-slate-800">{item.title}</p>
                {item.projectTitle && (
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {item.projectId ? (
                      <Link
                        to={`/admin/revenue?projectId=${item.projectId}`}
                        className="hover:text-blue-600 hover:underline"
                        title="Xem doanh thu của dự án này"
                      >
                        {item.projectTitle}
                      </Link>
                    ) : (
                      item.projectTitle
                    )}
                  </p>
                )}
                {item.checkoutId && (
                  <p className="mt-1 font-mono text-[11px] text-slate-400">
                    Giao dịch #{item.checkoutId.slice(0, 8)}
                  </p>
                )}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${item.source === 'PROJECT' ? 'bg-violet-50 text-violet-700' : item.source === 'PACKAGE' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700'}`}
                >
                  {sourceLabels[item.source]}
                </span>
              </td>
              <td className="max-w-[230px] px-4 py-4">
                <p className="truncate text-xs font-medium text-slate-700">
                  {item.payerName || '—'}
                </p>
                <p className="mt-1 truncate text-[11px] text-slate-400">{item.payerEmail}</p>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                {adminDate(item.createdAt)}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-slate-900">
                {money(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
