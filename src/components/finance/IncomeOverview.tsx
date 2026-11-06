import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { dateTime, financeApi, money } from '../../api/finance';
import { PATH_FREELANCER_EARNINGS } from '../../routes/paths';
import { useAuthStore } from '../../stores/useAuthStore';
import { Notice, inputClass, secondaryClass } from './FinanceUI';

export default function IncomeOverview({ compact = false }: { compact?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const [year, setYear] = useState<number>();
  const [page, setPage] = useState(0);
  const income = useQuery({
    queryKey: ['finance', user?.userId, 'income', year],
    queryFn: () => financeApi.income(year),
    enabled: user?.role === 'FREELANCER',
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  });
  const selectedYear = income.data?.year;
  const entries = useQuery({
    queryKey: ['finance', user?.userId, 'income-entries', selectedYear, page],
    queryFn: () => financeApi.incomeEntries(selectedYear!, page),
    enabled: !compact && selectedYear !== undefined,
  });
  if (income.isPending) return <p className="py-5 text-sm text-slate-500">Đang tải thu nhập…</p>;
  if (income.isError)
    return (
      <Notice error>
        Không tải được thu nhập.{' '}
        <button type="button" className="underline" onClick={() => void income.refetch()}>
          Thử lại
        </button>
      </Notice>
    );
  const data = income.data;
  return (
    <section aria-label="Thu nhập từ công việc" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Thu nhập từ công việc</h2>
        {compact ? (
          <Link
            to={PATH_FREELANCER_EARNINGS}
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            Xem thu nhập
          </Link>
        ) : (
          <label className="flex items-center gap-2 text-sm">
            Năm thống kê{' '}
            <select
              className={inputClass}
              value={data.year}
              onChange={(e) => {
                setYear(Number(e.target.value));
                setPage(0);
              }}
            >
              {Array.from(
                { length: Math.max(data.year, new Date().getFullYear()) - 1999 },
                (_, i) => Math.max(data.year, new Date().getFullYear()) - i
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Tổng thu nhập sau phí', data.totalNetIncome],
          [`Thu nhập năm ${data.year}`, data.yearNetIncome],
          ['Lần nghiệm thu có thu nhập', data.completedCount],
        ].map(([label, value], i) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {i === 2 ? value : money(Number(value))}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-slate-500">
        Thu nhập là thù lao sau phí của các dự án và đơn bảo trì đã nghiệm thu, không cộng tiền hoàn
        cọc. Rút tiền không làm giảm tổng thu nhập. Thời gian giữ tiền và số dư rút được xem riêng
        bên dưới.
      </p>
      {data.sandboxNetIncome > 0 && (
        <p className="text-xs text-slate-500">
          Thu nhập mô phỏng: {money(data.sandboxNetIncome)}. Không cộng vào thu nhập thật.
        </p>
      )}
      {!compact && (
        <>
          <p className="text-sm text-slate-600">
            Năm {data.year}: giá trị nghiệm thu <strong>{money(data.yearGrossIncome)}</strong> · Phí
            nền tảng <strong>{money(data.yearPlatformFees)}</strong> · Thù lao sau phí{' '}
            <strong>{money(data.yearNetIncome)}</strong>
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
            <table className="w-full text-left text-sm">
              <caption className="p-4 text-left font-semibold">
                Thu nhập theo tháng · Giờ Việt Nam
              </caption>
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tháng</th>
                  <th className="px-4 py-3 text-right">Thù lao sau phí</th>
                  <th className="px-4 py-3 text-right">Lần nghiệm thu</th>
                </tr>
              </thead>
              <tbody>
                {data.months.map((m) => (
                  <tr key={m.month} className="border-t border-slate-100">
                    <td className="px-4 py-3">Tháng {m.month}</td>
                    <td className="px-4 py-3 text-right font-semibold">{money(m.netIncome)}</td>
                    <td className="px-4 py-3 text-right">{m.completedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="font-semibold">Chi tiết thu nhập năm {data.year}</h3>
          {entries.isPending && <p className="text-sm text-slate-500">Đang tải chi tiết…</p>}
          {entries.isError && (
            <Notice error>
              Không tải được chi tiết.{' '}
              <button type="button" className="underline" onClick={() => void entries.refetch()}>
                Thử lại
              </button>
            </Notice>
          )}
          {entries.data?.items.length === 0 && (
            <Notice>Chưa có thu nhập thật được ghi nhận trong năm này.</Notice>
          )}
          {entries.data?.items.map((entry) => (
            <article
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4"
            >
              <div>
                <p className="font-semibold">
                  {entry.jobTitle}
                  {entry.maintenanceOrderId ? ' · Bảo trì có phí' : ''}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Nghiệm thu {dateTime(entry.acceptedAt)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Giá trị {money(entry.grossIncome)} · Phí {money(entry.platformFees)}
                </p>
              </div>
              <p className="font-bold text-blue-700">{money(entry.netIncome)}</p>
            </article>
          ))}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className={secondaryClass}
              disabled={page === 0 || entries.isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </button>
            <span className="self-center text-sm">Trang {page + 1}</span>
            <button
              type="button"
              className={secondaryClass}
              disabled={
                !entries.data || (page + 1) * 25 >= entries.data.totalElements || entries.isFetching
              }
              onClick={() => setPage((p) => p + 1)}
            >
              Tiếp
            </button>
          </div>
        </>
      )}
    </section>
  );
}
