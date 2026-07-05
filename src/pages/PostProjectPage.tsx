import type React from 'react';
import { useState } from 'react';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';

// === MOCK DATA ===
const SKILLS_SUGGESTION = [
  'UI/UX Design',
  'Figma',
  'ReactJS',
  'NextJS',
  'TailwindCSS',
  'Python',
  'Branding',
];

const PostProjectPage: React.FC = () => {
  // Quản lý Step hiện tại (1 -> 4)
  const [currentStep, setCurrentStep] = useState(1);

  // States lưu trữ dữ liệu các bước (Thực tế sẽ dùng chung 1 Object formData, ở đây chia nhỏ cho dễ nhìn)
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [budgetType, setBudgetType] = useState('ai'); // 'min', 'ai', 'max'
  const [duration, setDuration] = useState('fast'); // 'fast', 'normal', 'slow'
  const [upgrades, setUpgrades] = useState({ featured: false, urgent: false, warranty: true });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const goToStep = (step: number) => setCurrentStep(step);

  // Component Render Thanh Tiến Trình (Stepper)
  const renderStepper = () => {
    const steps = [
      { id: 1, label: 'Thông tin' },
      { id: 2, label: 'Ngân sách' },
      { id: 3, label: 'Nâng cấp' },
      { id: 4, label: 'Xem lại' },
    ];

    return (
      <div className="w-full max-w-3xl mx-auto mb-12 relative">
        {/* Đường gạch ngang nền xám */}
        <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-gray-200 -z-10" />
        {/* Đường gạch ngang xanh thể hiện tiến độ */}
        <div
          className="absolute top-5 left-[10%] h-[2px] bg-green-500 -z-10 transition-all duration-500"
          style={{ width: `${(currentStep - 1) * 33.33}%` }}
        />

        <div className="flex justify-between items-start">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-2 relative z-10 bg-[#F8FAFC] px-2 w-20"
              >
                {isCompleted ? (
                  <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      role="img"
                      aria-label="Completed"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-10 h-10 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {step.id}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center font-bold text-sm">
                    {step.id}
                  </div>
                )}
                <span
                  className={`text-[11px] md:text-xs font-bold whitespace-nowrap ${isActive || isCompleted ? (isCompleted ? 'text-green-500' : 'text-[#1D4ED8]') : 'text-gray-400'}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <ClientDashboardHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 flex flex-col">
        {/* Render Stepper Global */}
        {renderStepper()}

        {/* ================= STEP 1: THÔNG TIN ================= */}
        {currentStep === 1 && (
          <div className="w-full max-w-3xl mx-auto bg-white rounded-[32px] p-8 md:p-12 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col animate-[fadeIn_0.3s_ease-out]">
            <div className="mb-10">
              <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-2">
                Đăng dự án mới
              </h1>
              <p className="text-gray-500 text-sm">
                Bắt đầu bằng cách cung cấp các thông tin cơ bản để chúng tôi tìm được chuyên gia phù
                hợp nhất.
              </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="projectName" className="block text-sm font-bold text-gray-900 mb-2">
                  Tên dự án là gì? <span className="text-red-500">*</span>
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ví dụ: Thiết kế Website Landing Page cho Startup AI"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-bold text-gray-900 mb-2">
                  Chọn danh mục dự án <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-800 appearance-none focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Chọn danh mục --
                    </option>
                    <option value="dev">Lập trình & IT</option>
                    <option value="design">Thiết kế & Đồ họa</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Chevron Down"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
                  Mô tả chi tiết yêu cầu <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả công việc, mục tiêu và bất kỳ yêu cầu cụ thể nào..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-800 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors resize-none placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="upload-btn" className="block text-sm font-bold text-gray-900 mb-2">
                  Tài liệu đính kèm (Tùy chọn)
                </label>
                <div className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Cloud Upload"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Kéo thả hoặc{' '}
                    <button
                      id="upload-btn"
                      type="button"
                      className="text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0 p-0 font-bold"
                    >
                      tải lên từ máy tính
                    </button>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Hỗ trợ PDF, DOCX, PNG, JPG (Tối đa 25MB)
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="skills-dummy"
                  className="block text-sm font-bold text-gray-900 mb-3"
                >
                  Kỹ năng yêu cầu <span className="text-red-500">*</span>
                </label>
                <div id="skills-dummy" className="flex flex-wrap items-center gap-2.5">
                  {SKILLS_SUGGESTION.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className="text-xs font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-full transition-colors cursor-pointer"
                    >
                      {skill}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="text-xs font-bold text-[#1D4ED8] bg-white border border-[#DCE4FF] hover:bg-[#EEF2FF] px-4 py-2 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>+</span> Khác
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#0AAAD7] hover:bg-[#0896BD] text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border-0"
                >
                  Tiếp tục đến bước 2
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    role="img"
                    aria-label="Arrow Right"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 2: NGÂN SÁCH ================= */}
        {currentStep === 2 && (
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thiết lập ngân sách dự án</h1>
              <p className="text-gray-500 text-sm">
                Xác định mức giá phù hợp để thu hút những chuyên gia xuất sắc nhất dựa trên phân
                tích thị trường của AI
              </p>
            </div>

            {/* Khung Ngân sách */}
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2 text-gray-900 font-bold">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
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
                  </div>
                  Ngân sách dự kiến
                </div>
                <div className="bg-gray-100 text-gray-600 font-bold px-4 py-1.5 rounded-lg text-sm">
                  VNĐ
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="text-[48px] font-black text-[#1D4ED8] leading-none mb-4">
                  1.000.000
                </div>
                <div className="w-full max-w-lg mx-auto relative px-4">
                  <div className="w-full h-1 bg-gray-200 rounded-full">
                    <div className="w-1/3 h-full bg-[#1D4ED8] rounded-full relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-[#1D4ED8] border-2 border-white rounded-full shadow-md" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-semibold text-gray-400">
                    <span>500.000</span>
                    <span>100.000.000</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setBudgetType('min')}
                  className={`p-4 rounded-2xl border ${budgetType === 'min' ? 'border-[#1D4ED8] bg-[#EEF2FF]' : 'border-gray-200 bg-white hover:border-gray-300'} flex flex-col items-center justify-center transition-colors cursor-pointer`}
                >
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Mức thấp nhất
                  </span>
                  <span className="text-xl font-bold text-gray-900">500.000</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetType('ai')}
                  className={`relative p-4 rounded-2xl border ${budgetType === 'ai' ? 'border-[#1D4ED8] bg-[#EEF2FF] shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'} flex flex-col items-center justify-center transition-colors cursor-pointer`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1D4ED8] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                    Đề xuất bởi AI
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 mt-1">
                    Đề xuất
                  </span>
                  <span className="text-xl font-bold text-[#1D4ED8]">1.000.000</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetType('max')}
                  className={`p-4 rounded-2xl border ${budgetType === 'max' ? 'border-[#1D4ED8] bg-[#EEF2FF]' : 'border-gray-200 bg-white hover:border-gray-300'} flex flex-col items-center justify-center transition-colors cursor-pointer`}
                >
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Cao cấp
                  </span>
                  <span className="text-xl font-bold text-gray-900">5.000.000</span>
                </button>
              </div>
            </div>

            {/* Banner Định giá AI */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center shrink-0 shadow-md">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    role="img"
                    aria-label="AI Stars"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Định giá bằng AI</h3>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                    Sử dụng dữ liệu thị trường thời gian thực để phân tích độ phức tạp và đề xuất
                    mức giá tối ưu nhất.
                  </p>
                  <button
                    type="button"
                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 hover:text-[#1D4ED8] cursor-pointer bg-transparent border-0 p-0"
                  >
                    HỎI DỰ ÁN
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center hover:bg-[#153bb5] transition-colors cursor-pointer border-0"
              >
                <svg
                  className="w-5 h-5"
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
            </div>

            {/* Thời hạn hoàn thành */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <div className="flex items-center gap-2 text-gray-900 font-bold mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Calendar"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                Thời hạn hoàn thành
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setDuration('fast')}
                  className={`p-4 rounded-xl border ${duration === 'fast' ? 'border-[#1D4ED8] bg-[#EEF2FF]' : 'border-gray-200 bg-white hover:border-gray-300'} flex flex-col items-center justify-center transition-colors cursor-pointer`}
                >
                  <span className="text-sm font-bold text-gray-900 mb-1">Dưới 1 tháng</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Giao nhanh
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setDuration('normal')}
                  className={`p-4 rounded-xl border ${duration === 'normal' ? 'border-[#1D4ED8] bg-[#EEF2FF]' : 'border-gray-200 bg-white hover:border-gray-300'} flex flex-col items-center justify-center transition-colors cursor-pointer`}
                >
                  <span className="text-sm font-bold text-gray-900 mb-1">1 - 3 tháng</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Phổ biến
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setDuration('slow')}
                  className={`p-4 rounded-xl border ${duration === 'slow' ? 'border-[#1D4ED8] bg-[#EEF2FF]' : 'border-gray-200 bg-white hover:border-gray-300'} flex flex-col items-center justify-center transition-colors cursor-pointer`}
                >
                  <span className="text-sm font-bold text-gray-900 mb-1">Trên 3 tháng</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Dài hạn
                  </span>
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="bg-white rounded-[32px] p-6 border border-gray-100 flex items-center justify-between shadow-sm">
              <button
                type="button"
                onClick={prevStep}
                className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center gap-2 cursor-pointer bg-transparent border-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  role="img"
                  aria-label="Arrow Left"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Quay lại
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-[#1D4ED8] hover:bg-[#153bb5] text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border-0"
              >
                Tiếp tục đến bước 3
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
            </div>
          </div>
        )}

        {/* ================= STEP 3: NÂNG CẤP ================= */}
        {currentStep === 3 && (
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-[#1D4ED8] mb-2">Tăng hiệu quả tuyển dụng</h1>
              <p className="text-gray-500 text-sm">
                Chọn các gói nâng cấp để dự án của bạn nổi bật hơn và tìm được nhân sự chất lượng
                nhanh nhất.
              </p>
            </div>

            <h3 className="text-base font-bold text-gray-900 px-2 mt-4">
              Các tùy chọn nâng cấp khác
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1 */}
              <button
                type="button"
                className={`w-full text-left block bg-white rounded-[24px] p-6 border-2 transition-colors cursor-pointer relative ${upgrades.featured ? 'border-[#1D4ED8]' : 'border-transparent shadow-[0_4px_20px_rgb(0,0,0,0.03)]'}`}
                onClick={() => setUpgrades({ ...upgrades, featured: !upgrades.featured })}
              >
                <div
                  className={`absolute top-6 right-6 w-5 h-5 rounded border flex items-center justify-center ${upgrades.featured ? 'bg-[#1D4ED8] border-[#1D4ED8]' : 'border-gray-300'}`}
                >
                  {upgrades.featured && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      role="img"
                      aria-label="Checked"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Star"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">Nổi bật (Featured)</h4>
                <p className="text-[11px] text-gray-500 mb-6">
                  Giữ bài đăng của bạn ở vị trí ưu tiên hàng đầu trong 7 ngày.
                </p>
                <div className="text-sm font-bold text-[#1D4ED8]">59.000 VNĐ</div>
              </button>

              {/* Option 2 */}
              <button
                type="button"
                className={`w-full text-left block bg-white rounded-[24px] p-6 border-2 transition-colors cursor-pointer relative ${upgrades.urgent ? 'border-[#1D4ED8]' : 'border-transparent shadow-[0_4px_20px_rgb(0,0,0,0.03)]'}`}
                onClick={() => setUpgrades({ ...upgrades, urgent: !upgrades.urgent })}
              >
                <div
                  className={`absolute top-6 right-6 w-5 h-5 rounded border flex items-center justify-center ${upgrades.urgent ? 'bg-[#1D4ED8] border-[#1D4ED8]' : 'border-gray-300'}`}
                >
                  {upgrades.urgent && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      role="img"
                      aria-label="Checked"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Lightning"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">Gấp (Urgent)</h4>
                <p className="text-[11px] text-gray-500 mb-6">
                  Đánh dấu dự án là ưu tiên cao để nhận được hồ sơ ngay trong 24h.
                </p>
                <div className="text-sm font-bold text-[#1D4ED8]">99.000 VNĐ</div>
              </button>
            </div>

            {/* Big Blue Option */}
            <button
              type="button"
              className={`w-full text-left block bg-[#2563EB] rounded-[32px] p-8 md:p-10 border-2 transition-all cursor-pointer relative overflow-hidden ${upgrades.warranty ? 'border-[#60A5FA] shadow-[0_8px_30px_rgba(37,99,235,0.4)]' : 'border-transparent'}`}
              onClick={() => setUpgrades({ ...upgrades, warranty: !upgrades.warranty })}
            >
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex justify-between items-start relative z-10 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center border border-white/30">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Shield"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <span className="bg-white/20 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  Gợi ý
                </span>
              </div>
              <h4 className="text-xl font-bold text-white mb-2 relative z-10">Gói Bảo Hành</h4>
              <p className="text-sm text-white/80 mb-8 max-w-sm leading-relaxed relative z-10">
                SAM AI sẽ tự động phân tích yêu cầu và đề xuất danh sách 5 chuyên gia phù hợp nhất
                cho dự án của bạn.
              </p>
              <div className="text-2xl font-black text-white relative z-10">59.000 VNĐ</div>

              {/* Check icon top right if active */}
              <div
                className={`absolute top-8 right-8 w-6 h-6 rounded-full border-2 flex items-center justify-center ${upgrades.warranty ? 'bg-white border-white' : 'border-white/40'}`}
              >
                {upgrades.warranty && (
                  <svg
                    className="w-4 h-4 text-[#2563EB]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    role="img"
                    aria-label="Checked"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>

            {/* Bottom Bar */}
            <div className="bg-white rounded-[32px] p-6 border border-gray-100 flex flex-col md:flex-row items-center justify-between shadow-sm mt-4 gap-6 md:gap-0">
              <button
                type="button"
                onClick={prevStep}
                className="w-full md:w-auto text-sm font-bold text-gray-900 border border-gray-200 px-8 py-3.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer order-2 md:order-1"
              >
                Quay lại
              </button>

              <div className="flex flex-col md:flex-row items-center gap-6 order-1 md:order-2 w-full md:w-auto">
                <div className="text-center md:text-right">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Tổng cộng dự kiến:
                  </div>
                  <div className="text-[28px] font-black text-[#1D4ED8] leading-none">
                    1.000.000 VNĐ
                  </div>
                  <div className="text-[9px] text-gray-400 italic mt-1">
                    Bao gồm phí nâng cấp và bảo đảm dữ liệu.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full md:w-auto bg-[#0AAAD7] hover:bg-[#0896BD] text-white text-sm font-bold px-8 py-3.5 rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  Tiếp tục đến bước 4
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    role="img"
                    aria-label="Arrow Right"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: XEM LẠI ================= */}
        {currentStep === 4 && (
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-[#1D4ED8] mb-2">Xem lại dự án của bạn</h1>
              <p className="text-gray-500 text-sm">
                Kiểm tra lại lần cuối trước khi dự án được hiển thị cho các Freelancer tài năng trên
                toàn cầu.
              </p>
            </div>

            {/* Block 1: Mô tả dự án */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] relative">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="absolute top-8 right-8 text-xs font-bold text-[#1D4ED8] flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Edit"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Chỉnh sửa
              </button>
              <h2 className="text-xl font-bold text-[#1D4ED8] mb-6">Mô tả dự án</h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-3">
                    Thiết kế Mobile App Tài chính
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Dự án yêu cầu thiết kế giao diện (UI/UX) cho một ứng dụng tài chính tập trung
                    vào quản lý chi tiêu và đầu tư tiền điện tử. Cần tối ưu hóa trải nghiệm người
                    dùng, phong cách hiện đại, minh bạch và an toàn.
                  </p>
                </div>
                <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
                  <div className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1616077168079-7e09a6a71bb2?auto=format&fit=crop&w=400&q=80"
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 text-center font-medium">
                    Ảnh tham khảo dự án
                  </span>
                </div>
              </div>
            </div>

            {/* Block 2: Thông tin kỹ thuật */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] relative">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="absolute top-8 right-8 text-xs font-bold text-[#1D4ED8] flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Edit"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Chỉnh sửa
              </button>
              <h2 className="text-xl font-bold text-[#1D4ED8] mb-6">Thông tin kỹ thuật</h2>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-semibold text-[#1D4ED8] bg-[#EEF2FF] px-4 py-2 rounded-full border border-[#DCE4FF]">
                  UI/UX Design
                </span>
                <span className="text-xs font-semibold text-[#1D4ED8] bg-[#EEF2FF] px-4 py-2 rounded-full border border-[#DCE4FF]">
                  Fintech
                </span>
                <span className="text-xs font-semibold text-[#1D4ED8] bg-[#EEF2FF] px-4 py-2 rounded-full border border-[#DCE4FF]">
                  Mobile App
                </span>
                <span className="text-xs font-semibold text-[#1D4ED8] bg-[#EEF2FF] px-4 py-2 rounded-full border border-[#DCE4FF]">
                  AI Enhanced
                </span>
              </div>
            </div>

            {/* Block 3: Ngân sách & Báo giá */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] relative">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="absolute top-8 right-8 text-xs font-bold text-[#1D4ED8] flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Edit"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Chỉnh sửa
              </button>
              <h2 className="text-xl font-bold text-[#1D4ED8] mb-6">Ngân sách & Báo giá</h2>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="w-full md:w-auto">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Ngân sách cố định
                  </div>
                  <div className="text-xl font-black text-[#1D4ED8]">1.000.000 VNĐ</div>
                </div>
                <div className="w-full md:flex-1 max-w-sm bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Inbox"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">
                      Nhận báo giá từ Freelancer
                    </h4>
                    <p className="text-[10px] text-gray-500">
                      Freelancer có thể đề xuất giá tối ưu nhất cho bạn.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 4: Nâng cấp đã chọn */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] relative">
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="absolute top-8 right-8 text-xs font-bold text-[#1D4ED8] flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Edit"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Chỉnh sửa
              </button>
              <h2 className="text-xl font-bold text-[#1D4ED8] mb-6">Nâng cấp đã chọn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Stars"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-0.5">AI Talent Matching</h4>
                    <p className="text-[10px] text-gray-500">Tự động tìm freelancer phù hợp nhất</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      role="img"
                      aria-label="Shield"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-0.5">Bản quyền (IP)</h4>
                    <p className="text-[10px] text-gray-500">Bảo vệ quyền sở hữu trí tuệ tối đa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Block & Submit */}
            <div className="bg-[#EEF2FF] rounded-[32px] p-8 border border-[#DCE4FF] flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner mt-4">
              <div>
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Tổng cộng dự kiến:
                </div>
                <div className="text-[10px] text-gray-400 italic mb-2">
                  Bao gồm phí nâng cấp và bảo đảm thanh toán.
                </div>
              </div>
              <div className="text-[36px] font-black text-[#1D4ED8] leading-none">599.000 VNĐ</div>
            </div>

            <div className="flex items-center justify-between mt-4 mb-10 px-2">
              <button
                type="button"
                onClick={prevStep}
                className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center gap-2 cursor-pointer bg-transparent border-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  role="img"
                  aria-label="Arrow Left"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => alert('Đăng dự án thành công!')}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold px-10 py-4 rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2 cursor-pointer border-0"
              >
                Đăng dự án ngay
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Rocket"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 10.5L21 3m-7.5 7.5L8.25 15.75m5.25-5.25v6.75a1.5 1.5 0 01-2.483 1.13L8.25 15.75m5.25-5.25H6.75a1.5 1.5 0 01-1.13-2.483L10.5 8.25M13.5 10.5L8.25 15.75m0 0L3 21"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PostProjectPage;
