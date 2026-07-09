import type React from 'react';
import { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

// === MOCK DATA ===
const EARNINGS_STATS = {
  totalEarnings: 42750000,
  availableBalance: 18500000,
  escrowPending: 12500000,
};

const MONTHLY_DATA = [
  { month: 'T1', amount: 3200000 },
  { month: 'T2', amount: 5100000 },
  { month: 'T3', amount: 4800000 },
  { month: 'T4', amount: 7200000 },
  { month: 'T5', amount: 6100000 },
  { month: 'T6', amount: 8500000 },
  { month: 'T7', amount: 7850000 },
];

const LINKED_ACCOUNT = {
  bankName: 'Vietcombank',
  accountNumber: '****7892',
  accountHolder: 'NGUYEN VAN A',
};

const TRANSACTIONS = [
  {
    id: 't1',
    type: 'earning',
    description: 'Thanh toán dự án: Thiết kế bộ nhận diện thương hiệu',
    amount: 7600000,
    date: '08/07/2024',
    status: 'completed',
    projectId: 'fp3',
  },
  {
    id: 't2',
    type: 'withdrawal',
    description: 'Rút tiền về Vietcombank ****7892',
    amount: -5000000,
    date: '05/07/2024',
    status: 'completed',
  },
  {
    id: 't3',
    type: 'earning',
    description: 'Thanh toán dự án: Script Python crawl chứng khoán',
    amount: 1900000,
    date: '01/07/2024',
    status: 'completed',
    projectId: 'fp5',
  },
  {
    id: 't4',
    type: 'earning',
    description: 'Thanh toán dự án: Dịch thuật hợp đồng Việt - Anh',
    amount: 3325000,
    date: '25/06/2024',
    status: 'completed',
    projectId: 'fp2',
  },
  {
    id: 't5',
    type: 'withdrawal',
    description: 'Rút tiền về Vietcombank ****7892',
    amount: -10000000,
    date: '20/06/2024',
    status: 'completed',
  },
  {
    id: 't6',
    type: 'earning',
    description: 'Thanh toán dự án: Landing page cho startup',
    amount: 4750000,
    date: '15/06/2024',
    status: 'completed',
  },
  {
    id: 't7',
    type: 'escrow',
    description: 'Escrow dự án: Module thanh toán VNPay',
    amount: 5000000,
    date: '01/07/2024',
    status: 'pending',
    projectId: 'fp1',
  },
  {
    id: 't8',
    type: 'escrow',
    description: 'Escrow dự án: Nội dung SEO E-commerce',
    amount: 4000000,
    date: '05/07/2024',
    status: 'pending',
    projectId: 'fp4',
  },
];

const FreelancerEarningsPage: React.FC = () => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [availableBalance, setAvailableBalance] = useState(EARNINGS_STATS.availableBalance);

  const formatCurrency = (val: number) => {
    const absVal = Math.abs(val);
    return (val < 0 ? '-' : '') + absVal.toLocaleString('vi-VN') + ' VND';
  };

  const formatShortCurrency = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'tr';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
    return val.toString();
  };

  const maxAmount = Math.max(...MONTHLY_DATA.map((d) => d.amount));

  const filteredTransactions = TRANSACTIONS.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (amount > availableBalance) return;
    
    setWithdrawSuccess(true);
    setAvailableBalance(prev => prev - amount);
    setTimeout(() => {
      setShowWithdrawModal(false);
      setWithdrawSuccess(false);
      setWithdrawAmount('');
    }, 2500);
  };

  // Performance stats
  const currentMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1];
  const prevMonth = MONTHLY_DATA[MONTHLY_DATA.length - 2];
  const growthPercent = prevMonth
    ? (((currentMonth.amount - prevMonth.amount) / prevMonth.amount) * 100).toFixed(1)
    : '0';
  const isPositiveGrowth = Number(growthPercent) >= 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Thu nhập</h1>
          <p className="text-gray-500 text-sm">Quản lý thu nhập, số dư và lịch sử giao dịch</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng thu nhập</p>
            </div>
            <p className="text-2xl font-black text-gray-900">{formatCurrency(EARNINGS_STATS.totalEarnings)}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1D4ED8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Số dư khả dụng</p>
            </div>
            <p className="text-2xl font-black text-[#1D4ED8]">{formatCurrency(availableBalance)}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang chờ (Escrow)</p>
            </div>
            <p className="text-2xl font-black text-amber-600">{formatCurrency(EARNINGS_STATS.escrowPending)}</p>
          </div>
        </div>

        {/* Chart + Account */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          {/* Chart */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Hiệu suất tháng</h2>
                <p className="text-xs text-gray-400 mt-1">Biểu đồ thu nhập 7 tháng gần nhất</p>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${isPositiveGrowth ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                <svg className={`w-3 h-3 ${isPositiveGrowth ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                {isPositiveGrowth ? '+' : ''}{growthPercent}%
              </div>
            </div>

            {/* Line Chart */}
            <div className="relative h-64 mt-8 flex flex-col justify-end">
              {/* Chart Graph Area */}
              <div className="absolute inset-0 pb-10 px-2 pointer-events-none" style={{ paddingTop: '24px' }}>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#93C5FD" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  
                  {/* Area Fill */}
                  <polygon
                    fill="url(#area-gradient)"
                    points={`0,100 ${MONTHLY_DATA.map((d, i) => `${(i / (MONTHLY_DATA.length - 1)) * 100},${100 - (d.amount / maxAmount) * 100}`).join(' ')} 100,100`}
                  />
                  
                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="url(#line-gradient)"
                    strokeWidth="3"
                    points={MONTHLY_DATA.map((d, i) => `${(i / (MONTHLY_DATA.length - 1)) * 100},${100 - (d.amount / maxAmount) * 100}`).join(' ')}
                    filter="url(#glow)"
                  />
                </svg>
              </div>

              {/* Data Points (Absolute positions over SVG) */}
              <div className="absolute inset-0 pb-10 px-2 pointer-events-none" style={{ paddingTop: '24px' }}>
                <div className="relative w-full h-full">
                  {MONTHLY_DATA.map((data, i) => {
                    const heightPercent = (data.amount / maxAmount) * 100;
                    const isLast = i === MONTHLY_DATA.length - 1;
                    return (
                      <div 
                        key={data.month} 
                        className="absolute flex flex-col items-center justify-end" 
                        style={{ 
                          left: `${(i / (MONTHLY_DATA.length - 1)) * 100}%`, 
                          bottom: `${heightPercent}%`, 
                          transform: 'translateX(-50%) translateY(50%)' 
                        }}
                      >
                        <span className={`absolute bottom-4 text-[10px] font-bold whitespace-nowrap px-2 py-1 rounded-md transition-all ${isLast ? 'bg-[#1D4ED8] text-white shadow-md z-20' : 'text-gray-500 bg-white/80'}`}>
                          {formatShortCurrency(data.amount)}
                        </span>
                        <div className={`w-3.5 h-3.5 rounded-full border-[3px] bg-white transition-all ${isLast ? 'border-[#1D4ED8] shadow-[0_0_10px_rgba(29,78,216,0.5)] scale-125 z-20' : 'border-[#93C5FD]'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-Axis Month Labels */}
              <div className="flex justify-between relative z-10 w-full px-2 h-10 items-end">
                {MONTHLY_DATA.map((data, i) => {
                  const isLast = i === MONTHLY_DATA.length - 1;
                  return (
                    <div key={data.month} className="w-8 flex justify-center">
                      <span className={`text-xs font-bold ${isLast ? 'text-[#1D4ED8]' : 'text-gray-400'}`}>
                        {data.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Linked Account + Withdraw */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Tài khoản liên kết</h3>
              <div className="bg-gradient-to-br from-[#1D4ED8] to-[#0AAAD7] rounded-xl p-5 text-white mb-4">
                <p className="text-xs opacity-70 mb-1">Ngân hàng</p>
                <p className="font-bold text-lg mb-3">{LINKED_ACCOUNT.bankName}</p>
                <p className="text-xs opacity-70 mb-1">Số tài khoản</p>
                <p className="font-bold tracking-wider mb-3">{LINKED_ACCOUNT.accountNumber}</p>
                <p className="text-xs opacity-70 mb-1">Chủ tài khoản</p>
                <p className="font-bold text-sm">{LINKED_ACCOUNT.accountHolder}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(true)}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:opacity-90 transition-all cursor-pointer border-0 text-sm"
              >
                Rút tiền
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Số dư khả dụng: <strong className="text-[#1D4ED8]">{formatCurrency(availableBalance)}</strong>
              </p>
            </div>

            <div className="bg-[#EEF2FF] rounded-[24px] p-6 border border-[#DCE4FF] text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-[#1D4ED8] rounded-full text-white flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1D4ED8] mb-2">Thanh toán an toàn</h3>
              <p className="text-sm text-[#1D4ED8]/80">
                Mọi giao dịch trên SAM đều được bảo vệ bằng hệ thống Escrow an toàn.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900">Lịch sử giao dịch</h2>
            <div className="relative w-full md:w-48 shrink-0">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all shadow-sm cursor-pointer"
              >
                <option value="all">Tất cả</option>
                <option value="earning">Nhận tiền</option>
                <option value="withdrawal">Rút tiền</option>
                <option value="escrow">Đang chờ Escrow</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-4 hover:bg-gray-50/50 rounded-xl px-3 -mx-3 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'earning' ? 'bg-emerald-50' :
                    tx.type === 'withdrawal' ? 'bg-red-50' :
                    'bg-amber-50'
                  }`}>
                    {tx.type === 'earning' && (
                      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0-16l-4 4m4-4l4 4" />
                      </svg>
                    )}
                    {tx.type === 'withdrawal' && (
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V4m0 16l-4-4m4 4l4-4" />
                      </svg>
                    )}
                    {tx.type === 'escrow' && (
                      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">{tx.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{tx.date}</span>
                      {tx.status === 'pending' && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Đang chờ</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-bold whitespace-nowrap ${
                  tx.type === 'earning' ? 'text-emerald-600' :
                  tx.type === 'withdrawal' ? 'text-red-500' :
                  'text-amber-600'
                }`}>
                  {tx.type === 'earning' || tx.type === 'escrow' ? '+' : ''}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">
                Không có giao dịch nào trong danh mục này.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* === WITHDRAW MODAL === */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !withdrawSuccess && setShowWithdrawModal(false)}>
          <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {!withdrawSuccess ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#1D4ED8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Rút tiền</h3>
                  <p className="text-gray-500 text-sm">Rút tiền về tài khoản {LINKED_ACCOUNT.bankName} - {LINKED_ACCOUNT.accountNumber}</p>
                </div>

                <div className="mb-6">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Số tiền rút (VND)</label>
                  <input
                    type="text"
                    value={withdrawAmount ? Number(withdrawAmount).toLocaleString('vi-VN') : ''}
                    onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Nhập số tiền..."
                    className={`w-full py-3 px-4 border rounded-xl text-lg font-bold transition-all focus:outline-none focus:ring-2 ${
                      Number(withdrawAmount) > availableBalance 
                        ? 'border-red-300 text-red-600 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30' 
                        : 'border-gray-200 text-gray-900 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]'
                    }`}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-xs ${Number(withdrawAmount) > availableBalance ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {Number(withdrawAmount) > availableBalance ? 'Không đủ số dư để rút' : 'Số dư khả dụng:'}
                    </p>
                    <strong className={Number(withdrawAmount) > availableBalance ? 'text-red-500' : 'text-[#1D4ED8]'}>
                      {formatCurrency(availableBalance)}
                    </strong>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-colors cursor-pointer text-sm bg-white"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > availableBalance}
                    className="flex-1 py-3 bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] text-white font-bold rounded-full shadow-lg hover:opacity-90 transition-all cursor-pointer border-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Xác nhận rút tiền
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Yêu cầu rút tiền thành công!</h3>
                <p className="text-gray-500 text-sm mb-2">
                  Số tiền <strong className="text-[#1D4ED8]">{Number(withdrawAmount).toLocaleString('vi-VN')} VND</strong> đang được xử lý.
                </p>
                <p className="text-xs text-gray-400">Thời gian xử lý: 1-3 ngày làm việc</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerEarningsPage;
