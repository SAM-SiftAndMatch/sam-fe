import type React from 'react';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';

// === MOCK DATA ===
const STATS = [
  {
    id: 1,
    label: 'Tổng quan',
    count: '12',
    desc: 'Đã đăng',
    color: 'text-[#1D4ED8]',
    bg: 'bg-[#EEF2FF]',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    id: 2,
    label: 'Tiến độ',
    count: '04',
    desc: 'Đang thực hiện',
    color: 'text-[#0AAAD7]',
    bg: 'bg-[#E0F7FA]',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 3,
    label: 'Thành công',
    count: '48',
    desc: 'Hoàn thành',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 4,
    label: 'Lưu trữ',
    count: '03',
    desc: 'Bản nháp',
    color: 'text-gray-400',
    bg: 'bg-gray-100',
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  },
];

const DRAFTS = [
  { id: 1, title: 'Thiết kế UI/UX App Fintech', update: 'Cập nhật 2 giờ trước', progress: 65 },
  { id: 2, title: 'Viết Content Marketing Blog', update: 'Cập nhật 1 ngày trước', progress: 30 },
];

const HISTORY = [
  {
    id: 1,
    title: 'Website Thương mại điện tử',
    status: 'Hoàn thành vào 12/05/2024',
    price: '350.000 VND',
    badge: 'Hoàn thành',
    badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 2,
    title: 'Mobile App Đặt lịch khám bệnh',
    status: 'Đang thực hiện • Freelancer: Minh Đức',
    price: '480.000 VND',
    badge: 'Đang chạy',
    badgeColor: 'text-orange-500 bg-orange-50 border-orange-200',
  },
];

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Anh Tuấn vừa gửi báo cáo cho dự án',
    highlight: 'Fintech App',
    time: '10 phút trước',
    iconColor: 'text-[#1D4ED8]',
    iconBg: 'bg-[#EEF2FF]',
    iconPath:
      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    id: 2,
    title: 'Bạn có 3 bản nháp chưa hoàn thành. Hãy tiếp tục để tìm nhân tài!',
    highlight: '',
    time: '3 giờ trước',
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    iconPath:
      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  {
    id: 3,
    title: 'Thanh toán cho dự án E-commerce đã được xác nhận.',
    highlight: '',
    time: 'Hôm qua',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    iconPath:
      'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

const ClientDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* 1. Kế thừa Header riêng biệt */}
      <ClientDashboardHeader />

      {/* 2. Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 flex flex-col gap-10">
        {/* ================= HERO SECTION ================= */}
        <section className="flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Chào mừng trở lại,
            <br />
            Ngô Tiến Nhật
          </h1>
          <p className="text-gray-500 text-sm md:text-base mb-8 max-w-lg leading-relaxed">
            Bắt đầu dự án mới hoặc quản lý các công việc đang diễn ra một cách thông minh và hiệu
            quả hơn với SAM AI
          </p>
          <button
            type="button"
            className="bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] hover:opacity-90 text-white font-bold px-8 py-3.5 rounded-full shadow-[0_8px_20px_rgba(29,78,216,0.25)] transition-all flex items-center gap-2 cursor-pointer border-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              role="img"
              aria-label="Add"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tạo yêu cầu công việc
          </button>
        </section>

        {/* ================= STATS SECTION ================= */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-[24px] p-5 md:p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] flex flex-col relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label={stat.label}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                  {stat.label}
                </span>
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-black text-gray-900 leading-none mb-1">
                  {stat.count}
                </div>
                <div className="text-xs font-semibold text-gray-500">{stat.desc}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ================= VIP BANNER ================= */}
        <section className="w-full bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_8px_30px_rgba(29,78,216,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-start relative z-10 w-full md:w-2/3">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 text-white border border-white/30 flex items-center gap-1.5 shadow-sm">
              <svg
                className="w-3 h-3 text-yellow-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="Premium"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Premium
            </span>
            <h2 className="text-2xl font-bold text-white mb-3">
              AI hỗ trợ tạo Brief chuyên nghiệp
            </h2>
            <p className="text-white/80 text-sm mb-8 leading-relaxed max-w-md">
              Tiết kiệm 80% thời gian soạn thảo và tìm kiếm nhân tài phù hợp nhất thông qua hệ thống
              phân tích ngữ nghĩa thông minh.
            </p>
            <button
              type="button"
              className="bg-white text-[#1D4ED8] hover:bg-gray-50 font-bold px-8 py-3 rounded-full shadow-md transition-colors cursor-pointer border-0 text-sm"
            >
              Nâng cấp VIP
            </button>
          </div>

          <div className="relative z-10 w-28 h-28 shrink-0 bg-white/10 rounded-[32px] flex items-center justify-center border border-white/20 shadow-inner backdrop-blur-sm">
            <svg
              className="w-16 h-16 text-white/90"
              fill="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="AI Brain"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
        </section>

        {/* ================= BOTTOM GRID (Left & Right) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {/* Các yêu cầu nháp */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900">Các yêu cầu nháp</h3>
                <button
                  type="button"
                  className="text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DRAFTS.map((draft) => (
                  <div
                    key={draft.id}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {draft.update}
                      </span>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-0"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          role="img"
                          aria-label="More options"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                    <h4 className="text-[17px] font-bold text-gray-900 leading-snug mb-6 flex-grow">
                      {draft.title}
                    </h4>

                    <div className="mb-6">
                      <div className="flex justify-between items-center text-xs font-bold mb-2">
                        <span className="text-gray-500">Tiến độ hoàn thiện</span>
                        <span className="text-[#1D4ED8]">{draft.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1D4ED8] rounded-full transition-all"
                          style={{ width: `${draft.progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full py-3 rounded-xl border border-[#DCE4FF] text-[#1D4ED8] text-xs font-bold hover:bg-[#EEF2FF] transition-colors cursor-pointer mt-auto"
                    >
                      Tiếp tục chỉnh sửa
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Lịch sử công việc */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900">Lịch sử công việc</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Filter"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Tất cả trạng thái
                  </button>
                  <div className="relative">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Search"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Tìm dự án..."
                      className="w-36 text-xs bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#1D4ED8] placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] flex flex-col overflow-hidden">
                {HISTORY.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${index !== HISTORY.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          role="img"
                          aria-label="Project"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                        <span className="text-[11px] text-gray-500 font-medium">{item.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 mb-1">{item.price}</div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        role="img"
                        aria-label="Arrow Right"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* CỘT PHẢI (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Thông báo */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Thông báo</h3>
                <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
              </div>

              <div className="flex flex-col gap-5">
                {NOTIFICATIONS.map((noti) => (
                  <div key={noti.id} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${noti.iconBg} ${noti.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        role="img"
                        aria-label="Notification Icon"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={noti.iconPath} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 font-medium leading-relaxed mb-1">
                        {noti.title}{' '}
                        {noti.highlight && (
                          <span className="font-bold text-[#1D4ED8]">{noti.highlight}</span>
                        )}
                      </p>
                      <span className="text-[10px] text-gray-400 font-semibold">{noti.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full border-t border-gray-100 mt-6 pt-5 text-center">
                <button
                  type="button"
                  className="text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  Xem tất cả hoạt động
                </button>
              </div>
            </div>

            {/* Support Banner */}
            <div className="bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] rounded-3xl p-6 text-white relative overflow-hidden flex flex-col items-start shadow-md">
              <div className="absolute -bottom-6 -right-6 opacity-30 pointer-events-none">
                <svg
                  className="w-32 h-32"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Support Agent"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 relative z-10">Cần hỗ trợ?</h3>
              <p className="text-[11px] text-white/80 leading-relaxed mb-4 max-w-[200px] relative z-10">
                Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
              </p>
              <button
                type="button"
                className="text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0 p-0 relative z-10"
              >
                Liên hệ ngay
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  role="img"
                  aria-label="Arrow Right"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
};

export default ClientDashboardPage;
