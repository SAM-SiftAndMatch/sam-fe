import { useId, useState } from 'react';
import type { RevenueReport } from '../../api/admin';
import { money } from '../../api/finance';
import { adminDate } from './AdminUI';

export const sourceLabels = {
  PACKAGE: 'Gói dịch vụ',
  PROJECT: 'Phí dự án',
  ADDON: 'Tiện ích dự án',
  OTHER: 'Khoản khác',
};
export function RevenueTrend({ series }: { series: RevenueReport['series'] }) {
  const gradient = useId().replace(/:/g, '');
  const [selected, setSelected] = useState<number | null>(null);
  const values = series.map((point) => Number(point.amount));
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(1, ...values);
  const span = maximum - minimum || 1;
  const x = (index: number) => 18 + (index / Math.max(1, series.length - 1)) * 724;
  const y = (value: number) => 18 + ((maximum - value) / span) * 180;
  const points = values
    .map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(value)}`)
    .join(' ');
  const area = `${points} L${x(Math.max(0, series.length - 1))},${y(0)} L${x(0)},${y(0)} Z`;
  const index = Math.min(
    selected ?? Math.max(0, series.length - 1),
    Math.max(0, series.length - 1)
  );
  const current = series[index];
  return (
    <div className="p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-400">
            {current ? adminDate(`${current.day}T00:00:00+07:00`) : 'Chưa có dữ liệu'}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            {current ? money(current.amount) : '—'}
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          Doanh thu ghi nhận
        </span>
      </div>
      <div className="relative w-full">
        <svg
          viewBox="0 0 760 224"
          role="img"
          aria-label="Biểu đồ doanh thu theo ngày"
          className="block w-full overflow-visible"
        >
          <title>Doanh thu nền tảng theo ngày, đơn vị VND</title>
          <defs>
            <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity=".2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((tick) => (
            <line
              key={tick}
              x1="18"
              x2="742"
              y1={18 + tick * 60}
              y2={18 + tick * 60}
              stroke="#e9eef5"
              strokeDasharray="4 5"
            />
          ))}
          {series.length > 0 && (
            <>
              <path d={area} fill={`url(#${gradient})`} />
              <path
                d={points}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={x(index)}
                x2={x(index)}
                y1="18"
                y2="198"
                stroke="#93c5fd"
                strokeDasharray="4 4"
              />
              <circle
                cx={x(index)}
                cy={y(values[index])}
                r="4"
                fill="#2563eb"
                stroke="white"
                strokeWidth="2"
              />
            </>
          )}
        </svg>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{series[0]?.day ? adminDate(`${series[0].day}T00:00:00+07:00`) : '—'}</span>
          <span>
            {series.at(-1)?.day ? adminDate(`${series.at(-1)?.day}T00:00:00+07:00`) : '—'}
          </span>
        </div>
      </div>
      {series.length > 1 && (
        <label className="mt-4 flex items-center gap-3 text-[11px] text-slate-400">
          Xem từng ngày
          <input
            aria-label="Chọn ngày xem doanh thu"
            type="range"
            min="0"
            max={series.length - 1}
            value={index}
            onChange={(event) => setSelected(Number(event.target.value))}
            className="min-w-0 flex-1 cursor-pointer accent-blue-600"
          />
        </label>
      )}
    </div>
  );
}
export function RevenueSources({ totals }: { totals: RevenueReport['totals'] }) {
  const values = [
    { name: 'Gói dịch vụ', amount: Number(totals.packages), color: 'bg-blue-600' },
    { name: 'Phí dự án', amount: Number(totals.projects), color: 'bg-violet-500' },
    { name: 'Tiện ích dự án', amount: Number(totals.addons), color: 'bg-teal-500' },
    { name: 'Khoản khác', amount: Number(totals.other), color: 'bg-slate-400' },
  ];
  const maximum = Math.max(1, ...values.map((value) => Math.abs(value.amount)));
  return (
    <div className="space-y-6 p-5">
      {values.map((value) => (
        <div key={value.name}>
          <div className="mb-2 flex justify-between gap-3 text-xs">
            <span className="text-slate-500">{value.name}</span>
            <span className="font-semibold text-slate-800">{money(value.amount)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${value.amount < 0 ? 'bg-amber-500' : value.color}`}
              style={{ width: `${(Math.abs(value.amount) / maximum) * 100}%` }}
            />
          </div>
        </div>
      ))}
      <p className="border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-400">
        Tính theo bút toán doanh thu LIVE. Tiền ký quỹ và khoản đang chờ đối soát chưa được cộng vào
        doanh thu.
      </p>
    </div>
  );
}
