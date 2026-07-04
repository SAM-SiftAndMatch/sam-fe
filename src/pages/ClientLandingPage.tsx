import type React from 'react';
import Footer from '../components/Footer';
import GuestHeader from '../components/GuestHeader';

// MOCK DATA: Giúp code JSX bên dưới gọn gàng, đúng chuẩn Clean Code
const CATEGORIES = [
  {
    id: 1,
    name: 'Lập trình',
    count: '1,245 Freelancers',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  },
  {
    id: 2,
    name: 'Thiết kế',
    count: '2,102 Freelancers',
    icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
  },
  {
    id: 3,
    name: 'Viết lách',
    count: '850 Freelancers',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  },
  {
    id: 4,
    name: 'Video',
    count: '420 Freelancers',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  },
  {
    id: 5,
    name: 'Marketing',
    count: '1,500 Freelancers',
    icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
  },
  {
    id: 6,
    name: 'Dịch thuật',
    count: '320 Freelancers',
    icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
  },
  {
    id: 7,
    name: 'Dữ liệu',
    count: '150 Freelancers',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    id: 8,
    name: 'Tư vấn',
    count: '640 Freelancers',
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    content:
      '"AI Matching của SAM thật sự đáng kinh ngạc. Tôi tìm được một Designer hiểu ý mình ngay từ lần gặp đầu tiên. Rất đáng đồng tiền gạo!"',
    name: 'Anh Tuấn',
    role: 'CEO, TechFlow Startup',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 2,
    content:
      '"Quy trình thanh toán an toàn và minh bạch. Tôi cảm thấy hoàn toàn yên tâm khi giao phó những dự án quan trọng của công ty cho SAM."',
    name: 'Chị Lan Phương',
    role: 'Marketing Manager, F&B Group',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 3,
    content:
      '"Từ khi chuyển sang dùng AI Brief Assistant, việc đăng dự án trở nên nhẹ nhàng hơn hẳn. Thông tin rõ ràng nên freelancer báo giá rất sát."',
    name: 'Minh Hoàng',
    role: 'Freelance Project Lead',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
  },
];

const ClientLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* HEADER */}
      <GuestHeader />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* ================= HERO SECTION ================= */}
        <section className="w-full relative pt-20 pb-16 px-4 flex flex-col items-center text-center overflow-hidden">
          {/* Background Blur */}
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#0AAAD7]/20 to-[#1D4ED8]/10 blur-[100px] rounded-full pointer-events-none" />

          <h1 className="text-4xl md:text-[52px] font-bold text-gray-900 leading-tight mb-6 relative z-10 max-w-3xl">
            Kết nối Freelancer <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] italic">
              phù hợp nhất
            </span>{' '}
            cho dự án
          </h1>
          <p className="text-gray-500 text-base mb-10 max-w-2xl relative z-10">
            Nền tảng đầu tiên tại Việt Nam ứng dụng AI để phân tích và đề xuất nhân tài chính xác
            99% cho nhu cầu doanh nghiệp.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mb-4 relative z-10">
            Bạn cần hoàn thành công việc gì?
          </h2>

          {/* Search Bar */}
          <div className="w-full max-w-2xl bg-white rounded-full p-2.5 flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 relative z-10 mb-6">
            <span className="pl-4 text-gray-400">
              <svg
                className="w-5 h-5"
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
            </span>
            <input
              type="text"
              aria-label="Tìm kiếm công việc"
              placeholder="Mô tả công việc bạn cần (ví dụ: 'Thiết kế logo hiện đại cho startup AI')"
              className="flex-1 bg-transparent border-0 focus:ring-0 outline-none text-sm px-3 text-gray-700 placeholder:text-gray-400"
            />
            <button
              type="button"
              className="bg-[#1D4ED8] hover:bg-[#153bb5] text-white text-sm font-bold px-8 py-3 rounded-full transition-colors cursor-pointer border-0 shrink-0"
            >
              Tìm kiếm
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 mb-12">
            <span className="text-sm text-gray-500">Gợi ý:</span>
            {[
              'Thiết kế Website',
              'UI/UX Design',
              'Video Editing',
              'Content Creator',
              'AI Engineer',
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 relative z-10 mb-16">
            <button
              type="button"
              className="bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] hover:shadow-lg text-white font-bold px-8 py-3.5 rounded-2xl transition-all cursor-pointer border-0"
            >
              Tạo yêu cầu công việc
            </button>
            <button
              type="button"
              className="bg-white hover:bg-gray-50 text-[#1D4ED8] font-bold px-8 py-3.5 rounded-2xl border border-gray-200 shadow-sm transition-colors cursor-pointer"
            >
              Tìm Việc Freelance
            </button>
          </div>

          {/* Stats Box */}
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-8 md:p-10 flex items-center justify-around relative z-10 divide-x divide-gray-100">
            <div className="flex flex-col items-center flex-1">
              <span className="text-3xl font-black text-[#1D4ED8] mb-1">10,000+</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                FREELANCER
              </span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-3xl font-black text-[#1D4ED8] mb-1">5,000+</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                DỰ ÁN
              </span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-3xl font-black text-[#1D4ED8] mb-1">98%</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                HÀI LÒNG
              </span>
            </div>
          </div>
        </section>

        {/* ================= CATEGORIES SECTION ================= */}
        <section className="w-full max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lĩnh vực phổ biến</h2>
              <p className="text-sm text-gray-500">Khám phá cộng đồng chuyên gia tài năng nhất</p>
            </div>
            <button
              type="button"
              className="text-sm font-bold text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0 flex items-center gap-1"
            >
              Tất cả danh mục
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Arrow Right"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label={cat.name}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-[11px] text-gray-500 font-medium">{cat.count}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= PROCESS SECTION ================= */}
        <section className="w-full bg-gradient-to-b from-white to-[#F4F7FF] py-20 px-4 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Quy trình tuyển dụng thông minh
            </h2>
            <p className="text-sm text-gray-500 mb-16">
              Tiết kiệm 80% thời gian tìm kiếm nhờ công nghệ AI hàng đầu
            </p>

            <div className="flex flex-col md:flex-row items-start justify-between relative gap-10 md:gap-0">
              {/* Dashed Line Background (Desktop only) */}
              <div className="hidden md:block absolute top-7 left-[10%] right-[10%] border-t-2 border-dashed border-gray-300 z-0" />

              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1 relative z-10">
                <div className="w-14 h-14 bg-[#1D4ED8] rounded-full text-white text-xl font-bold flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(29,78,216,0.4)]">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Tạo yêu cầu</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">
                  Sử dụng AI Brief Assistant để mô tả công việc hoàn hảo chỉ trong 30 giây.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center flex-1 relative z-10">
                <div className="w-14 h-14 bg-[#1D4ED8] rounded-full text-white text-xl font-bold flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(29,78,216,0.4)]">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">AI phân tích</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">
                  Hệ thống quét hàng ngàn hồ sơ để tìm ra những người có kỹ năng khớp nhất.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center flex-1 relative z-10">
                <div className="w-14 h-14 bg-[#1D4ED8] rounded-full text-white text-xl font-bold flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(29,78,216,0.4)]">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Nhận danh sách</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">
                  Nhận Top 3 chuyên gia được đề xuất cùng với báo cáo phân tích năng lực.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PRICING SECTION (Tái sử dụng HTML Bảng giá) ================= */}
        <section className="w-full max-w-5xl mx-auto px-4 py-20 flex flex-col items-center">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Gói dịch vụ linh hoạt</h2>
            <p className="text-gray-500 text-sm">
              Lựa chọn giải pháp phù hợp với quy mô dự án của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {/* Gói Basic */}
            <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col h-full mt-4">
              <div className="mb-8">
                <h2 className="text-[22px] font-bold text-gray-900 mb-2">Basic</h2>
                <p className="text-gray-500 text-xs">Dành cho cá nhân khởi đầu</p>
              </div>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-black text-gray-900 leading-none">0đ</span>
                <span className="text-gray-500 text-sm font-medium mb-1">/tháng</span>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-4 h-4 text-gray-600 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[13px] text-gray-700 font-medium">
                    Đăng dự án không giới hạn
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-4 h-4 text-gray-600 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[13px] text-gray-700 font-medium">Phí dịch vụ 5%</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-4 h-4 text-gray-600 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[13px] text-gray-700 font-medium">Hỗ trợ email</span>
                </li>
              </ul>
              <button
                type="button"
                className="w-full bg-white text-gray-800 text-sm font-bold py-3.5 rounded-full transition-colors cursor-pointer border border-gray-200 hover:bg-gray-50 mt-auto"
              >
                Bắt đầu miễn phí
              </button>
            </div>

            {/* Gói Business */}
            <div className="bg-gradient-to-br from-[#1D4ED8] to-[#0AAAD7] rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgba(29,78,216,0.25)] flex flex-col relative transform md:-translate-y-4 h-[calc(100%+16px)] border border-blue-400/30">
              <div className="absolute -top-3 right-8 bg-white text-[#1D4ED8] text-[9px] font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                PHỔ BIẾN
              </div>
              <div className="mb-8">
                <h2 className="text-[22px] font-bold text-white mb-2">Business</h2>
                <p className="text-white/80 text-xs">Dành cho doanh nghiệp cần tối ưu</p>
              </div>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-[40px] font-black text-white leading-none">249.000đ</span>
                <span className="text-white/80 text-sm font-medium mb-1.5">/tháng</span>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow">
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-2.5 h-2.5 text-[#1D4ED8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                      role="img"
                      aria-label="Check"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-white font-bold">
                    AI Talent Matching ưu tiên
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-2.5 h-2.5 text-[#1D4ED8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                      role="img"
                      aria-label="Check"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-white font-bold">Phí dịch vụ chỉ 2%</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-2.5 h-2.5 text-[#1D4ED8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                      role="img"
                      aria-label="Check"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-white font-bold">
                    Quản lý dự án chuyên biệt
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-2.5 h-2.5 text-[#1D4ED8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                      role="img"
                      aria-label="Check"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-white font-bold">Hỗ trợ 24/7 qua Hotline</span>
                </li>
              </ul>
              <button
                type="button"
                className="w-full bg-white text-[#1D4ED8] text-sm hover:bg-gray-50 font-bold py-3.5 rounded-full shadow-lg transition-colors cursor-pointer border-0 mt-auto"
              >
                Nâng cấp ngay
              </button>
            </div>

            {/* Gói Premium */}
            <div className="bg-gradient-to-br from-[#1D4ED8] to-[#0AAAD7] rounded-[32px] p-8 md:p-10 shadow-[0_4px_20px_rgba(29,78,216,0.15)] flex flex-col h-full mt-4 border border-blue-400/30">
              <div className="mb-8">
                <h2 className="text-[22px] font-bold text-white mb-2">Premium</h2>
                <p className="text-white/80 text-xs">Dành cho khách cần bảo hiểm</p>
              </div>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-[40px] font-black text-white leading-none">299.000đ</span>
                <span className="text-white/80 text-sm font-medium mb-1.5">/tháng</span>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow">
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-2.5 h-2.5 text-[#1D4ED8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                      role="img"
                      aria-label="Check"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-white font-bold">Bảo hiểm chất lượng</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-2.5 h-2.5 text-[#1D4ED8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                      role="img"
                      aria-label="Check"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-white font-bold">Quét lỗi chuyên sâu</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-2.5 h-2.5 text-[#1D4ED8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                      role="img"
                      aria-label="Check"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-white font-bold">
                    Chống nhận về mã nguồn rác
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-2.5 h-2.5 text-[#1D4ED8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                      role="img"
                      aria-label="Check"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-white font-bold">Hỗ trợ 24/7 qua Hotline</span>
                </li>
              </ul>
              <button
                type="button"
                className="w-full bg-white text-[#1D4ED8] text-sm hover:bg-gray-50 font-bold py-3.5 rounded-full shadow-lg transition-colors cursor-pointer border-0 mt-auto"
              >
                Nâng cấp ngay
              </button>
            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS SECTION ================= */}
        <section className="w-full bg-[#F4F7FF] py-20 px-4">
          <div className="max-w-6xl mx-auto flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center">
              Khách hàng nói về SAM
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {TESTIMONIALS.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col"
                >
                  <p className="text-sm text-gray-600 italic leading-relaxed mb-8 flex-grow">
                    {review.content}
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{review.name}</h4>
                      <p className="text-[11px] text-gray-500 font-medium">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= BOTTOM CTA SECTION ================= */}
        <section className="w-full max-w-5xl mx-auto px-4 py-20">
          <div className="w-full bg-gradient-to-br from-[#1D4ED8] to-[#0AAAD7] rounded-[40px] p-12 md:p-20 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10 leading-tight">
              Bắt đầu thuê đúng Freelancer <br /> ngay hôm nay
            </h2>
            <p className="text-sm md:text-base text-white/90 mb-10 max-w-lg relative z-10 leading-relaxed">
              Đăng ký tài khoản doanh nghiệp miễn phí và trải nghiệm sức mạnh của AI trong việc
              tuyển dụng nhân tài.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
              <button
                type="button"
                className="bg-white text-[#1D4ED8] font-bold px-8 py-4 rounded-2xl shadow-lg hover:bg-gray-50 transition-colors cursor-pointer border-0"
              >
                Đăng dự án miễn phí
              </button>
              <button
                type="button"
                className="bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                Nhận tư vấn giải pháp
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default ClientLandingPage;
