import type React from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { PATH_CLIENT_CONFIRM_PROJECT } from '../routes/paths';

// === MOCK DATA ===
const SKILLS_SUGGESTION = [
  'Soạn thảo văn bản',
  'Nhập liệu',
  'Word/Excel',
  'Dịch thuật',
  'Viết nội dung',
  'Trợ lý ảo',
  'Quản trị Admin',
];

type LocationState = {
  keyword?: string;
  selectedTags?: string[];
  projectName?: string;
  category?: string;
  description?: string;
  selectedSkills?: string[];
  budgetAmount?: number;
  upgrades?: { featured: boolean; urgent: boolean; warranty: boolean };
  restoreStep?: number;
};

const PostProjectPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    keyword = '',
    selectedTags: initialTags = [],
    projectName: initialProjectName = '',
    category: initialCategory = '',
    description: initialDescription = '',
    selectedSkills: initialSkills = [],
    budgetAmount: initialBudgetAmount = 1000000,
    upgrades: initialUpgrades = { featured: false, urgent: false, warranty: true },
    restoreStep = 1,
  } = (location.state as LocationState) || {};
  const [selectedTags] = useState<string[]>(initialTags);

  // Quản lý Step hiện tại (1 -> 4)
  const [currentStep, setCurrentStep] = useState(restoreStep);
  const [highestStep, setHighestStep] = useState(restoreStep);

  useEffect(() => {
    setHighestStep((prev) => Math.max(prev, currentStep));
  }, [currentStep]);

  // States lưu trữ dữ liệu các bước (Thực tế sẽ dùng chung 1 Object formData, ở đây chia nhỏ cho dễ nhìn)
  const [projectName, setProjectName] = useState(initialProjectName);
  const [category, setCategory] = useState(initialCategory);
  const [description, setDescription] = useState(initialDescription);

  // State quản lý kỹ năng yêu cầu
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false);
  const [customSkill, setCustomSkill] = useState('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (customSkill.trim()) {
        const newSkill = customSkill.trim();
        if (!selectedSkills.includes(newSkill)) {
          setSelectedSkills([...selectedSkills, newSkill]);
        }
        setCustomSkill('');
        setShowCustomSkillInput(false);
      } else {
        setShowCustomSkillInput(false);
      }
    }
  };

  // Tự động điền dữ liệu nếu từ trang AI Brief chuyển sang
  useEffect(() => {
    if (selectedTags.length > 0 && !description) {
      const tags = selectedTags.map((t) => t.split('-')[1]).filter(Boolean);

      const generatedText = `Dự án: ${keyword.toUpperCase()}

1. Mục tiêu & Đối tượng
Dự án hướng tới tập khách hàng: ${tags.length > 0 ? tags.join(', ') : 'Chưa xác định cụ thể.'}

2. Phong cách thiết kế mong muốn
Chúng tôi mong muốn một thiết kế hiện đại, tập trung vào trải nghiệm người dùng (UX) mượt mà và giao diện (UI) bắt mắt. 
Mọi chi tiết thiết kế cần đề cao tính ứng dụng và dễ sử dụng cho người dùng cuối.

3. Tài liệu sẵn có
Hiện tại chúng tôi đã chuẩn bị một số tài liệu cơ bản. Tùy thuộc vào quá trình làm việc sẽ cung cấp thêm.

4. Yêu cầu chuyên môn
- Tư duy sản phẩm tốt, hiểu về luồng người dùng.
- Ưu tiên ứng viên đã từng làm các dự án có chung lĩnh vực.

5. Ngân sách & Thời gian
Ngân sách linh hoạt dựa trên năng lực thực tế. Thời gian hoàn thành mong muốn sẽ được trao đổi cụ thể sau khi phỏng vấn.`;

      setDescription(generatedText);
      if (keyword) setProjectName(keyword);
    }
  }, [selectedTags, keyword, description]);

  const [budgetType, setBudgetType] = useState('ai'); // 'min', 'ai', 'max', 'custom'
  const [budgetAmount, setBudgetAmount] = useState(initialBudgetAmount); // Giá trị mặc định
  const [aiPricingState, setAiPricingState] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [aiSuggestedPrice, setAiSuggestedPrice] = useState(initialBudgetAmount);
  const [isInsightExpanded, setIsInsightExpanded] = useState(false);
  const [duration, setDuration] = useState('fast'); // 'fast', 'normal', 'slow'

  // Kích hoạt AI Pricing khi vào bước 2
  useEffect(() => {
    if (currentStep === 2 && aiPricingState === 'idle') {
      setAiPricingState('analyzing');

      setTimeout(() => {
        // Giả lập tính toán giá dựa trên độ dài description hoặc tags
        let basePrice = 1000000;
        if (description.length > 500) basePrice += 500000;

        const hasUrgency = selectedTags.some(
          (t) => t.toLowerCase().includes('sớm') || t.toLowerCase().includes('gấp')
        );
        if (hasUrgency) basePrice += 1000000;

        setAiSuggestedPrice(basePrice);
        setBudgetAmount(basePrice);
        setBudgetType('ai');
        setAiPricingState('done');
      }, 1500);
    }
  }, [currentStep, aiPricingState, description, selectedTags]);

  const [upgrades, setUpgrades] = useState(initialUpgrades);

  const totalUpgradesCost =
    (upgrades.featured ? 59000 : 0) +
    (upgrades.urgent ? 99000 : 0) +
    (upgrades.warranty ? 59000 : 0);
  const totalPrice = budgetAmount + totalUpgradesCost;

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const goToStep = (step: number) => setCurrentStep(step);

  // Cuộn lên đầu khi chuyển bước
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const [step1Errors, setStep1Errors] = useState({
    projectName: false,
    category: false,
    description: false,
  });

  const handleNextStep1 = () => {
    const errors = {
      projectName: !projectName.trim(),
      category: !category,
      description: !description.trim(),
    };
    setStep1Errors(errors);
    if (!errors.projectName && !errors.category && !errors.description) {
      nextStep();
    }
  };

  // Component Render Thanh Tiến Trình (Stepper)
  const renderStepper = () => {
    const steps = [
      { id: 1, label: 'Thông tin' },
      { id: 2, label: 'Ngân sách' },
      { id: 3, label: 'Nâng cấp' },
      { id: 4, label: 'Kiểm tra' },
    ];

    return (
      <div className="w-full max-w-3xl mx-auto mb-12 relative">
        {/* Container cho đường gạch ngang, căn chuẩn từ tâm step 1 đến tâm step 4 */}
        <div className="absolute top-5 left-[40px] right-[40px] h-[2px] bg-gray-400 z-0">
          {/* Đường gạch ngang xanh thể hiện tiến độ */}
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-start">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div
                key={step.id}
                onClick={() => {
                  if (step.id <= highestStep) goToStep(step.id);
                }}
                className={`flex flex-col items-center gap-2 relative z-10 bg-[#F8FAFC] px-1 md:px-2 w-14 md:w-20 text-center shrink-0 ${step.id <= highestStep ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : 'cursor-not-allowed'}`}
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

            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleNextStep1();
              }}
            >
              <div>
                <label htmlFor="projectName" className="block text-sm font-bold text-gray-900 mb-2">
                  Tên dự án là gì? <span className="text-red-500">*</span>
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    setStep1Errors((p) => ({ ...p, projectName: false }));
                  }}
                  placeholder="Ví dụ: Thiết kế Website Landing Page cho Startup AI"
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-1 transition-colors placeholder:text-gray-400 ${
                    step1Errors.projectName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-[#1D4ED8] focus:ring-[#1D4ED8]'
                  }`}
                />
                {step1Errors.projectName && (
                  <p className="text-red-500 text-xs mt-1">Vui lòng nhập tên dự án</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-bold text-gray-900 mb-2">
                  Chọn danh mục dự án <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setStep1Errors((p) => ({ ...p, category: false }));
                    }}
                    className={`w-full bg-white border rounded-xl pl-4 pr-10 py-3 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                      step1Errors.category
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-[#1D4ED8] focus:ring-[#1D4ED8]'
                    }`}
                  >
                    <option value="" disabled>
                      -- Chọn danh mục --
                    </option>
                    <option value="dev">Lập trình & IT</option>
                    <option value="text">Tác vụ văn bản văn phòng</option>
                    <option value="translate">Dịch thuật</option>
                    <option value="marketing">Tiếp thị & Quảng cáo</option>
                    <option value="data">Dữ liệu & Phân tích</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {step1Errors.category && (
                  <p className="text-red-500 text-xs mt-1">Vui lòng chọn danh mục</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
                  Mô tả chi tiết yêu cầu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    rows={6}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setStep1Errors((p) => ({ ...p, description: false }));
                    }}
                    placeholder="Mô tả các tính năng cần có, công nghệ yêu cầu, hoặc bất kỳ thông tin nào giúp chuyên gia hiểu rõ dự án của bạn..."
                    className={`w-full bg-white border rounded-xl p-4 text-sm text-gray-800 focus:outline-none focus:ring-1 transition-colors placeholder:text-gray-400 resize-none ${
                      step1Errors.description
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-[#1D4ED8] focus:ring-[#1D4ED8]'
                    }`}
                  />

                </div>
                {step1Errors.description && (
                  <p className="text-red-500 text-xs mt-1">Vui lòng nhập mô tả chi tiết dự án</p>
                )}
              </div>

              {/* 
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
              */}

              <div className="mb-4">
                <label
                  htmlFor="skills-dummy"
                  className="block text-sm font-bold text-gray-900 mb-3"
                >
                  Kỹ năng yêu cầu <span className="text-red-500">*</span>
                </label>
                <div id="skills-dummy" className="flex flex-wrap items-center gap-2.5">
                  {/* Gợi ý kỹ năng */}
                  {SKILLS_SUGGESTION.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-[#EEF2FF] text-[#1D4ED8] border-[#1D4ED8]'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}

                  {/* Kỹ năng được thêm tùy chỉnh */}
                  {selectedSkills
                    .filter((s) => !SKILLS_SUGGESTION.includes(s))
                    .map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="text-xs font-semibold bg-[#EEF2FF] text-[#1D4ED8] border border-[#1D4ED8] px-4 py-2 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {skill} <span className="font-bold">×</span>
                      </button>
                    ))}

                  {/* Nút Khác / Input Khác */}
                  {!showCustomSkillInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomSkillInput(true)}
                      className="text-xs font-bold text-[#1D4ED8] bg-white border border-[#DCE4FF] hover:bg-[#EEF2FF] px-4 py-2 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>+</span> Khác
                    </button>
                  ) : (
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={handleAddCustomSkill}
                      onBlur={() => {
                        if (!customSkill.trim()) setShowCustomSkillInput(false);
                      }}
                      placeholder="Nhập & nhấn Enter"
                      className="text-xs font-semibold px-4 py-2 rounded-full border border-[#1D4ED8] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] w-48 text-[#1D4ED8] bg-white"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] hover:opacity-90 text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border-0"
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
            {aiPricingState === 'analyzing' ? (
              <div className="bg-white rounded-[32px] p-12 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1D4ED8] to-[#3B82F6] text-white flex items-center justify-center shadow-lg mb-8 animate-pulse">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  SAM AI đang định giá dự án...
                </h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  Hệ thống đang quét dữ liệu thị trường và phân tích bản Brief của bạn để đưa ra mức
                  ngân sách tối ưu nhất.
                </p>
                <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-[#3B82F6] rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Thiết lập ngân sách dự án
                  </h1>
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
                      {new Intl.NumberFormat('vi-VN').format(budgetAmount)}
                    </div>
                    <div className="w-full max-w-lg mx-auto relative px-4">
                      <input
                        type="range"
                        min={500000}
                        max={100000000}
                        step={500000}
                        value={budgetAmount}
                        onChange={(e) => {
                          setBudgetAmount(Number(e.target.value));
                          setBudgetType('custom');
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#1D4ED8] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#1D4ED8,0_2px_4px_rgba(0,0,0,0.1)]"
                        style={{
                          background: `linear-gradient(to right, #1D4ED8 ${((budgetAmount - 500000) / (100000000 - 500000)) * 100}%, #E5E7EB ${((budgetAmount - 500000) / (100000000 - 500000)) * 100}%)`,
                        }}
                      />
                      <div className="flex justify-between mt-2 text-[10px] font-semibold text-gray-400">
                        <span>500.000</span>
                        <span>100.000.000</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setBudgetType('min');
                        setBudgetAmount(aiSuggestedPrice * 0.7);
                      }}
                      className={`p-4 rounded-2xl border ${budgetType === 'min' ? 'border-[#1D4ED8] bg-[#EEF2FF]' : 'border-gray-200 bg-white hover:border-gray-300'} flex flex-col items-center justify-center transition-colors cursor-pointer`}
                    >
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                        Mức thấp nhất
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        {new Intl.NumberFormat('vi-VN').format(aiSuggestedPrice * 0.7)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBudgetType('ai');
                        setBudgetAmount(aiSuggestedPrice);
                      }}
                      className={`relative p-4 rounded-2xl border ${budgetType === 'ai' ? 'border-[#1D4ED8] bg-[#EEF2FF] shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'} flex flex-col items-center justify-center transition-colors cursor-pointer`}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1D4ED8] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                        Đề xuất bởi AI
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 mt-1">
                        Đề xuất
                      </span>
                      <span className="text-xl font-bold text-[#1D4ED8]">
                        {new Intl.NumberFormat('vi-VN').format(aiSuggestedPrice)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBudgetType('max');
                        setBudgetAmount(aiSuggestedPrice * 1.5);
                      }}
                      className={`p-4 rounded-2xl border ${budgetType === 'max' ? 'border-[#1D4ED8] bg-[#EEF2FF]' : 'border-gray-200 bg-white hover:border-gray-300'} flex flex-col items-center justify-center transition-colors cursor-pointer`}
                    >
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                        Cao cấp
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        {new Intl.NumberFormat('vi-VN').format(aiSuggestedPrice * 1.5)}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Banner Định giá AI */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col gap-4">
                  <div
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => setIsInsightExpanded(!isInsightExpanded)}
                  >
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
                          Nhấp để xem giải thích chi tiết từ SAM AI về mức giá đề xuất này.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center group-hover:bg-[#DCE4FF] transition-colors border-0"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform ${isInsightExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {isInsightExpanded && (
                    <div className="mt-2 pt-4 border-t border-gray-100 animate-[fadeIn_0.3s_ease-out]">
                      <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#EEF2FF]">
                        <div className="flex items-center gap-2 mb-2 text-[#1D4ED8] font-bold text-sm">
                          <span>💡</span>
                          Insight từ SAM AI:
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Dựa trên yêu cầu của bạn về danh mục{' '}
                          <strong>
                            {category === 'dev' ? 'Lập trình & IT' : 'Thiết kế/Văn bản'}
                          </strong>
                          , mức thù lao trung bình hiện nay rơi vào khoảng{' '}
                          <strong>
                            {new Intl.NumberFormat('vi-VN').format(aiSuggestedPrice)} VNĐ
                          </strong>
                          . Việc đưa ra mức giá hợp lý này sẽ giúp bạn thu hút được lượng lớn
                          Freelancer chất lượng cao trong thời gian ngắn nhất.
                        </p>
                      </div>
                    </div>
                  )}
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
                    className="bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] hover:opacity-90 text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border-0"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
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
              </div>
              <h4 className="text-xl font-bold text-white mb-2 relative z-10">
                Gói Bảo Hành (Gợi ý sử dụng)
              </h4>
              <p className="text-sm text-white/80 mb-8 max-w-sm leading-relaxed relative z-10">
                SAM AI sẽ tự động kiểm tra sản phẩm đầu ra, hỗ trợ khắc phục lỗi và giải quyết các
                vấn đề phát sinh trong 30 ngày sau nghiệm thu.
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
                    {new Intl.NumberFormat('vi-VN').format(totalPrice)} VNĐ
                  </div>
                  <div className="text-[9px] text-gray-400 italic mt-1">
                    Bao gồm phí nâng cấp và bảo đảm dữ liệu.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full md:w-auto bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] hover:opacity-90 text-white text-sm font-bold px-8 py-3.5 rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
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
                    {projectName || 'Tên dự án chưa nhập'}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {description || 'Chưa có mô tả chi tiết'}
                  </p>
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
                {selectedSkills.length > 0 ? (
                  selectedSkills.map((item, index) => (
                    <div key={index} className="relative group inline-block mt-2 mr-2">
                      <span className="text-xs font-semibold text-[#1D4ED8] bg-[#EEF2FF] px-4 py-2 rounded-full border border-[#DCE4FF] inline-block">
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSkills((prev) => prev.filter((s) => s !== item));
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500 flex items-center justify-center cursor-pointer shadow-sm transition-all"
                        title="Xóa kỹ năng này"
                      >
                        <svg
                          className="w-2.5 h-2.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 italic">
                    Chưa chọn kỹ năng / chuyên môn
                  </span>
                )}
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
                    Ngân sách dự kiến
                  </div>
                  <div className="text-xl font-black text-[#1D4ED8]">
                    {new Intl.NumberFormat('vi-VN').format(budgetAmount)} VNĐ
                  </div>
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
                      Giá có thể điều chỉnh với Freelancer
                    </h4>
                    <p className="text-[10px] text-gray-500">
                      Có thể thương lượng thêm sau khi tìm được Freelancer phù hợp.
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
                {!upgrades.featured && !upgrades.urgent && !upgrades.warranty && (
                  <div className="text-sm text-gray-500 italic col-span-2">
                    Không có gói nâng cấp nào được chọn.
                  </div>
                )}
                {upgrades.featured && (
                  <div className="flex items-center gap-3 border border-gray-200 rounded-2xl p-4 relative group">
                    <button
                      type="button"
                      onClick={() => setUpgrades({ ...upgrades, featured: false })}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500 flex items-center justify-center cursor-pointer shadow-sm transition-all"
                      title="Bỏ nâng cấp này"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5">
                        Nổi bật (Featured)
                        <span className="text-[#1D4ED8] ml-1.5">+59.000đ</span>
                      </h4>
                      <p className="text-[10px] text-gray-500">Ghim dự án lên đầu trang</p>
                    </div>
                  </div>
                )}
                {upgrades.urgent && (
                  <div className="flex items-center gap-3 border border-gray-200 rounded-2xl p-4 relative group">
                    <button
                      type="button"
                      onClick={() => setUpgrades({ ...upgrades, urgent: false })}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500 flex items-center justify-center cursor-pointer shadow-sm transition-all"
                      title="Bỏ nâng cấp này"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5">
                        Gấp (Urgent)
                        <span className="text-[#1D4ED8] ml-1.5">+99.000đ</span>
                      </h4>
                      <p className="text-[10px] text-gray-500">Ưu tiên tìm freelancer trong 24h</p>
                    </div>
                  </div>
                )}
                {upgrades.warranty && (
                  <div className="flex items-center gap-3 border border-gray-200 rounded-2xl p-4 relative group">
                    <button
                      type="button"
                      onClick={() => setUpgrades({ ...upgrades, warranty: false })}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500 flex items-center justify-center cursor-pointer shadow-sm transition-all"
                      title="Bỏ nâng cấp này"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5">
                        Gói Bảo Hành
                        <span className="text-[#1D4ED8] ml-1.5">+59.000đ</span>
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        AI tự động matching chuyên gia phù hợp
                      </p>
                    </div>
                  </div>
                )}
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
              <div className="text-[36px] font-black text-[#1D4ED8] leading-none">
                {new Intl.NumberFormat('vi-VN').format(totalPrice)} VNĐ
              </div>
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
                onClick={() =>
                  navigate(PATH_CLIENT_CONFIRM_PROJECT, {
                    state: {
                      projectName,
                      description,
                      category,
                      budgetAmount,
                      upgrades,
                      selectedSkills,
                      selectedTags,
                    },
                  })
                }
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold px-10 py-4 rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2 cursor-pointer border-0"
              >
                Đăng dự án ngay
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
