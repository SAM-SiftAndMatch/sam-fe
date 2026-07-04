import type React from 'react';
import { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

const ApplyJobPage: React.FC = () => {
  const [paymentType, setPaymentType] = useState<'project' | 'milestone'>('project');
  const [amount, setAmount] = useState<string>('20000000');
  const [experience, setExperience] = useState('');
  const [timeframe, setTimeframe] = useState('1 - 3 tháng');
  const [plan, setPlan] = useState('');

  const numericAmount = Number.parseInt(amount.replace(/\D/g, '') || '0', 10);
  const serviceFee = numericAmount * 0.05;
  const totalReceive = numericAmount - serviceFee;

  const formatCurrency = (val: number) => {
    return `${new Intl.NumberFormat('vi-VN').format(val)}đ`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Đã lưu hồ sơ ứng tuyển! (Mock)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF4FF] to-[#F8FAFC] font-sans flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-[#E2E8F0]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Phát triển Hệ thống Chatbot AI
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-[#0047FF]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Money"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    15.000.000đ - 25.000.000đ
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-[#0047FF]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Location"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Hà Nội (Remote)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-[#0047FF]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Time"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Đăng 2 giờ trước
                  </div>
                </div>
              </div>
              <div className="bg-[#EEF2FF] text-[#1D4ED8] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Match"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                PHÙ HỢP 98%
              </div>
            </div>
          </div>

          <div className="bg-[#F0F7FF] rounded-2xl p-5 border-l-4 border-[#00B2FF] flex flex-col gap-2 shadow-sm">
            <div className="flex items-center gap-2 text-[#00B2FF] text-xs font-bold uppercase tracking-widest">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                role="img"
                aria-label="AI Bulb"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Mẹo từ SAM AI
            </div>
            <p className="text-sm text-gray-700 italic font-medium">
              "Khách hàng này ưu tiên những freelancer có kinh nghiệm về LangChain. Hãy chắc chắn
              bạn đã liệt kê nó trong phần kỹ năng."
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-[#E2E8F0]">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#EEF2FF] text-[#1D4ED8] rounded-lg flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Experience"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              Kinh nghiệm & Kỹ năng
            </h2>

            <div className="mb-6">
              <label
                htmlFor="experience"
                className="block text-xs font-semibold text-gray-500 mb-2"
              >
                Mô tả các dự án tương tự bạn đã làm
              </label>
              <textarea
                id="experience"
                rows={4}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Ví dụ: Tôi đã xây dựng 3 hệ thống Chatbot cho lĩnh vực E-commerce sử dụng OpenAI API..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-sm text-gray-700 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors resize-none placeholder:text-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="skills-dummy"
                className="block text-xs font-semibold text-gray-500 mb-3"
              >
                Kỹ năng áp dụng cho dự án này
              </label>
              <div id="skills-dummy" className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-700 bg-[#F1F5F9] border border-[#E2E8F0] px-3 py-1.5 rounded-full">
                  Python
                </span>
                <span className="text-[11px] font-semibold text-gray-700 bg-[#F1F5F9] border border-[#E2E8F0] px-3 py-1.5 rounded-full">
                  OpenAI API
                </span>
                <span className="text-[11px] font-semibold text-gray-700 bg-[#F1F5F9] border border-[#E2E8F0] px-3 py-1.5 rounded-full">
                  LangChain
                </span>
                <button
                  type="button"
                  className="text-[11px] font-bold text-[#1D4ED8] bg-white border border-[#1D4ED8] hover:bg-[#EEF2FF] px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>+</span> Thêm kỹ năng
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-[#E2E8F0]">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#EEF2FF] text-[#1D4ED8] rounded-lg flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="File"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </span>
              Nộp hồ sơ
            </h2>

            <div className="w-full border-2 border-dashed border-[#A5B4FC] bg-[#F8FAFC] hover:bg-[#EEF2FF] transition-colors rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer">
              <div className="w-12 h-12 bg-[#1D4ED8] text-white rounded-xl flex items-center justify-center mb-3 shadow-md">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Upload"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-900 mb-1">
                Tải lên CV hoặc Portfolio
              </span>
              <span className="text-[11px] font-medium text-gray-500">
                Kéo thả file hoặc click để chọn (PDF, DOCX lên tới 10MB)
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-[#E2E8F0]">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#EEF2FF] text-[#1D4ED8] rounded-lg flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Wallet"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </span>
              Chi tiết thù lao
            </h2>

            <div className="flex bg-[#F1F5F9] p-1 rounded-xl mb-6 max-w-sm">
              <button
                type="button"
                onClick={() => setPaymentType('project')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${paymentType === 'project' ? 'bg-[#1D4ED8] text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Theo dự án
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('milestone')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${paymentType === 'milestone' ? 'bg-[#1D4ED8] text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Chia theo mốc (Milestones)
              </button>
            </div>

            <div className="mb-6">
              <label htmlFor="amount" className="block text-xs font-semibold text-gray-500 mb-2">
                Số tiền bạn muốn nhận (VND)
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-4 pr-16 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-xs font-bold text-gray-400">
                  VND
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Phí dịch vụ SAM (5%)</span>
                <span className="font-semibold text-gray-700">-{formatCurrency(serviceFee)}</span>
              </div>
              <div className="w-full border-t border-gray-200 border-dashed" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Số tiền thực nhận</span>
                <span className="text-xl font-black text-[#1D4ED8]">
                  {formatCurrency(totalReceive)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-[#E2E8F0]">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#EEF2FF] text-[#1D4ED8] rounded-lg flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Plan"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
              Kế hoạch thực hiện
            </h2>

            <div className="flex flex-col gap-5">
              <div>
                <label
                  htmlFor="timeframe"
                  className="block text-xs font-semibold text-gray-500 mb-2"
                >
                  Thời gian hoàn thành dự kiến
                </label>
                <input
                  id="timeframe"
                  type="text"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="plan" className="block text-xs font-semibold text-gray-500 mb-2">
                  Phương án thực hiện dự án
                </label>
                <textarea
                  id="plan"
                  rows={4}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Trình bày sơ lược quy trình, công cụ và kết quả mong muốn..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-sm text-gray-700 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors resize-none placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-[#1D4ED8] to-[#0AAAD7] p-8 md:p-10 text-white flex flex-col items-center text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />

            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center gap-1.5 border border-white/30 shadow-sm">
              <svg
                className="w-3 h-3 text-yellow-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="Star"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Dịch vụ ưu tiên
            </span>

            <h2 className="text-2xl font-bold mb-1">Nâng tầm hồ sơ của bạn</h2>
            <div className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-1">
              Giá chỉ từ
            </div>
            <div className="text-[40px] font-black mb-6">49.000đ</div>

            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 w-full max-w-md">
              <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 border border-white/20">
                <div className="w-5 h-5 rounded-full bg-white text-[#1D4ED8] flex items-center justify-center">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-bold">Gắn huy hiệu "Nổi bật"</span>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 border border-white/20">
                <div className="w-5 h-5 rounded-full bg-white text-[#1D4ED8] flex items-center justify-center">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    role="img"
                    aria-label="Check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-bold">Đẩy top danh sách ứng viên</span>
              </div>
            </div>

            <p className="text-sm font-medium text-white/90 mb-8 max-w-md">
              Được đề xuất lên đầu danh sách và nhận phản hồi sớm hơn gấp 3 lần.
            </p>

            <button
              type="button"
              className="bg-white text-[#1D4ED8] hover:bg-gray-50 font-bold px-12 py-3.5 rounded-full shadow-lg transition-colors cursor-pointer border-0"
            >
              Nâng cấp ngay
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:opacity-95 text-white font-bold py-4 rounded-full transition-shadow shadow-md flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              Gửi hồ sơ ứng tuyển
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                role="img"
                aria-label="Send"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
            <button
              type="button"
              className="sm:w-40 bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-full transition-colors border border-[#E2E8F0] shadow-sm cursor-pointer"
            >
              Lưu nháp
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default ApplyJobPage;
