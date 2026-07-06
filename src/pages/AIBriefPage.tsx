import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../routes/paths';
import ClientDashboardHeader from '../components/ClientDashboardHeader';

// === MOCK DATA ===
const MOCK_QUESTIONS = [
  {
    id: 1,
    category: 'Mục tiêu dự án',
    title: 'Đối tượng khách hàng mục tiêu của bạn là ai?',
    tags: ['Gen Z', 'Nhà đầu tư', 'Doanh nghiệp (B2B)', 'Mẹ bỉm sữa'],
    accentColor: 'bg-[#1D4ED8]',
  },
  {
    id: 2,
    category: 'Phong cách',
    title: 'Phong cách thiết kế chủ đạo mà bạn mong muốn?',
    tags: ['Minimalist', 'Hi-tech', 'Trẻ trung, năng động', 'Sang trọng, đẳng cấp'],
    accentColor: 'bg-purple-400',
  },
  {
    id: 3,
    category: 'Tài liệu sẵn có',
    title: 'Bạn đã có những tài liệu nào rồi?',
    tags: ['Brand Guideline', 'Logo', 'Nội dung (Text/Image)', 'Chưa có gì'],
    accentColor: 'bg-emerald-500',
  },
  {
    id: 4,
    category: 'Ngân sách',
    title: 'Ngân sách dự kiến của bạn ở mức nào?',
    tags: ['Tiết kiệm', 'Linh hoạt', 'Thoải mái', 'Cần tư vấn thêm'],
    accentColor: 'bg-teal-400',
  },
  {
    id: 5,
    category: 'Thời gian',
    title: 'Deadline dự kiến để hoàn thành dự án?',
    tags: ['Càng sớm càng tốt (ASAP)', '1-2 tuần', '1 tháng', 'Không gấp'],
    accentColor: 'bg-orange-400',
  },
];

type AIState = 'idle' | 'analyzing' | 'result';

const AIBriefPage: React.FC = () => {
  const navigate = useNavigate();
  const [aiState, setAiState] = useState<AIState>('idle');
  const [keyword, setKeyword] = useState('');
  const [loadingText, setLoadingText] = useState('Đang kết nối với SAM AI...');
  
  // Lưu danh sách các tag đã được chọn (lưu theo định dạng: "questionId-tag")
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleAnalyze = () => {
    if (!keyword.trim()) {
      alert('Vui lòng nhập từ khóa dự án!');
      return;
    }
    setAiState('analyzing');
    setLoadingText(`SAM AI đang quét hàng ngàn mẫu dự án tương tự về "${keyword}"...`);

    // Simulate AI thinking process
    setTimeout(() => {
      setLoadingText('Đang phân tích và tự động sinh bảng câu hỏi tối ưu...');
      
      setTimeout(() => {
        setAiState('result');
      }, 1500);
    }, 1500);
  };

  const toggleTag = (qId: number, tag: string) => {
    const tagId = `${qId}-${tag}`;
    setSelectedTags((prev) => 
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleComplete = () => {
    // Điều hướng sang trang Confirm Project hoặc New Project Flow
    navigate(paths.PATH_CLIENT_PROJECT_NEW);
  };
  
  const handleSkip = () => {
    navigate(paths.PATH_CLIENT_PROJECT_NEW);
  };

  return (
    // Sử dụng h-screen và overflow-hidden để khóa scroll bên ngoài
    <div className="h-screen bg-[#F8FAFC] font-sans flex flex-col overflow-hidden">
      <div className="shrink-0">
        <ClientDashboardHeader />
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col overflow-hidden">
        {/* White Card Container - Tự động flex để chiếm chiều cao và cho phép nội dung bên trong cuộn */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 md:p-8 flex flex-col relative border border-gray-100 flex-1 overflow-hidden">
          
          {/* Header Section (Cố định, không cuộn) */}
          <div className="shrink-0 mb-4">
            <div className="inline-flex items-center gap-2 bg-[#F0F7FF] text-[#1D4ED8] px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 w-fit border border-[#DCE4FF]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Trợ lý AI Thông minh
            </div>

            <h1 className="text-2xl md:text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
              Bắt đầu mô tả dự án của bạn
            </h1>
            <p className="text-gray-500 text-sm mb-6 max-w-2xl">
              Nhập các từ khóa hoặc lĩnh vực bạn cần. SAM AI sẽ tự động phân tích và tạo bộ câu hỏi
              khảo sát để giúp bạn tối ưu bản Brief một cách chuyên nghiệp nhất.
            </p>

            {/* Input Form */}
            {aiState === 'idle' && (
              <div className="w-full relative flex flex-col md:flex-row items-center p-2 bg-white border border-gray-200 rounded-2xl md:rounded-full focus-within:border-[#3B82F6] focus-within:ring-1 focus-within:ring-[#3B82F6] transition-all shadow-sm mb-2 gap-2 md:gap-0">
                <div className="hidden md:flex pl-4 pr-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Ví dụ: Thiết kế App Fintech, Xây dựng website E-commerce..."
                  className="flex-1 w-full bg-transparent border-0 focus:ring-0 outline-none text-sm px-4 md:px-2 py-3 md:py-0 text-gray-700 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="w-full md:w-auto bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-bold px-8 py-3.5 md:py-3 rounded-xl md:rounded-full transition-colors cursor-pointer border-0 shrink-0 shadow-sm"
                >
                  Phân tích
                </button>
              </div>
            )}

            {/* Loading State */}
            {aiState === 'analyzing' && (
              <div className="flex items-center gap-4 mb-2 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#3B82F6] text-white flex items-center justify-center shadow-md shrink-0">
                  <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-2 flex-1 max-w-md">
                  <span className="text-sm font-bold text-[#1D4ED8] transition-all duration-300">
                    {loadingText}
                  </span>
                  <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-[#3B82F6] rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Result Content - Vùng có thể cuộn (Scrollable Area) */}
          {aiState === 'result' && (
            <div className="flex-1 overflow-y-auto pr-3 pb-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 py-2 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Đã tạo xong bộ câu hỏi cho: "{keyword}"
                </h2>
                <button 
                  type="button"
                  onClick={() => setAiState('idle')}
                  className="text-sm text-[#3B82F6] hover:underline font-semibold cursor-pointer border-0 bg-transparent"
                >
                  Phân tích lại
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_QUESTIONS.map((q) => (
                  <div
                    key={q.id}
                    className="relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col group"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${q.accentColor}`} />
                    
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-2">
                      {q.category}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 leading-snug pl-2">
                      {q.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-auto pl-2">
                      {q.tags.map((tag) => {
                        const tagId = `${q.id}-${tag}`;
                        const isSelected = selectedTags.includes(tagId);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(q.id, tag)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer border ${
                              isSelected 
                                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions for Result */}
              <div className="pt-8 pb-4 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={handleComplete}
                  className="w-full md:w-auto bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-bold px-12 py-3.5 rounded-full shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  Tạo bản brief hoàn chỉnh
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Action for Idle state */}
          {aiState === 'idle' && (
            <div className="mt-auto pt-4 text-center pb-2">
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-0 underline underline-offset-4"
              >
                Bỏ qua & Tự nhập thông tin
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AIBriefPage;
