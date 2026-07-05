import type React from 'react';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';

// === MOCK DATA ===
// Tách dữ liệu ra để vòng lặp map HTML ngắn gọn và dễ bảo trì
const MOCK_QUESTIONS = [
  {
    id: 1,
    category: 'Mục tiêu dự án',
    title: 'Đối tượng khách hàng mục tiêu của bạn là ai?',
    tags: ['Gen Z', 'Nhà đầu tư'],
    accentColor: 'bg-[#1D4ED8]',
  },
  {
    id: 2,
    category: 'Phong cách',
    title: 'Phong cách thiết kế chủ đạo mà bạn mong muốn?',
    tags: ['Minimalist', 'Hi-tech'],
    accentColor: 'bg-purple-400',
  },
  {
    id: 3,
    category: 'Tài liệu sẵn có',
    title: 'Bạn đã có bộ nhận diện thương hiệu chưa?',
    tags: ['Đã có Brand Guideline'],
    accentColor: 'bg-emerald-500',
  },
  {
    id: 4,
    category: 'Ngân sách',
    title: 'Ngân sách của bạn tầm bao nhiêu?',
    tags: ['Khiêm tốn', 'Thoải mái'],
    accentColor: 'bg-teal-400',
  },
];

const AIBriefPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* 1. Kế thừa Header riêng của Dashboard Khách hàng */}
      <ClientDashboardHeader />

      {/* 2. Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 md:py-16">
        {/* White Card Container */}
        <div className="bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 md:p-16 flex flex-col relative overflow-hidden border border-gray-50">
          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 bg-[#F0F7FF] text-[#1D4ED8] px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 w-fit border border-[#DCE4FF]">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              role="img"
              aria-label="AI Sparkles"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            Trợ lý AI Thông minh
          </div>

          <h1 className="text-3xl md:text-[40px] font-bold text-gray-900 mb-4 tracking-tight leading-tight">
            Bắt đầu mô tả dự án của bạn
          </h1>
          <p className="text-gray-500 text-sm md:text-base mb-10 max-w-2xl leading-relaxed">
            Nhập các từ khóa hoặc lĩnh vực bạn cần. SAM AI sẽ tự động phân tích và tạo bộ câu hỏi
            khảo sát để giúp bạn tối ưu bản Brief tốt nhất.
          </p>

          {/* Search/Input Form */}
          <div className="w-full relative flex flex-col md:flex-row items-center p-2 bg-white border border-gray-200 rounded-2xl md:rounded-full focus-within:border-[#3B82F6] focus-within:ring-1 focus-within:ring-[#3B82F6] transition-all shadow-sm mb-8 gap-2 md:gap-0">
            <div className="hidden md:flex pl-4 pr-2 text-gray-400">
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
            </div>
            <input
              type="text"
              aria-label="Nhập từ khóa dự án"
              placeholder="Ví dụ: Thiết kế App Fintech, Xây dựng website E-commerce..."
              className="flex-1 w-full bg-transparent border-0 focus:ring-0 outline-none text-sm px-4 md:px-2 py-3 md:py-0 text-gray-700 placeholder:text-gray-400"
            />
            <button
              type="button"
              className="w-full md:w-auto bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-bold px-8 py-3.5 md:py-3 rounded-xl md:rounded-full transition-colors cursor-pointer border-0 shrink-0 shadow-sm"
            >
              Phân tích
            </button>
          </div>

          {/* Loading/Analyzing Indicator */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#3B82F6] text-white flex items-center justify-center shadow-md shrink-0">
              <svg
                className="w-6 h-6 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="Analyzing"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-2 flex-1 max-w-xs">
              <span className="text-xs font-bold text-gray-900">
                Đang phân tích yêu cầu từ bạn...
              </span>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-[#3B82F6] rounded-full animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>

          {/* Dynamic Question Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {MOCK_QUESTIONS.map((q) => (
              <div
                key={q.id}
                className="relative bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-md transition-shadow flex flex-col overflow-hidden group cursor-pointer"
              >
                {/* Dải màu accent ở viền trái */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${q.accentColor}`} />

                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {q.category}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-[#3B82F6] transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Arrow Right"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>

                <h3 className="text-[15px] font-bold text-gray-900 mb-6 leading-snug pr-4">
                  {q.title}
                </h3>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {q.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="text-[11px] font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="mt-14 flex flex-col md:flex-row items-center justify-center gap-6">
            <button
              type="button"
              className="w-full md:w-auto bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-bold px-10 py-4 rounded-full shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              Tạo bản brief hoàn chỉnh
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                role="img"
                aria-label="Arrow Right"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button
              type="button"
              className="w-full md:w-auto text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-0 p-0 text-center"
            >
              Bỏ qua & Tự nhập thông tin
            </button>
          </div>
        </div>
      </main>

      {/* 3. Kế thừa Footer chung */}
      <Footer />
    </div>
  );
};

export default AIBriefPage;
