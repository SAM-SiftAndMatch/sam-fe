import type React from 'react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jobApi from '../api/job';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { PATH_CLIENT_POST_PROJECT, PATH_CLIENT_SUCCESS_PROJECT } from '../routes/paths';

const PROJECT_CATEGORIES = [
  'Lập trình & IT',
  'Thiết kế đồ họa & Video',
  'Tiếp thị & Quảng cáo',
  'Viết lách & Dịch thuật',
  'Tác vụ văn bản & Nhập liệu',
  'Dữ liệu & Phân tích',
  'Quản trị & Trợ lý ảo',
  'Tài chính & Kế toán',
  'Khác',
];

type LocationState = {
  projectId?: string;
  projectName?: string;
  description?: string;
  category?: string;
  budgetAmount?: number;
  upgrades?: { featured: boolean; urgent: boolean; warranty: boolean };
  selectedSkills?: string[];
  selectedTags?: string[];
  srsDocumentUrl?: string;
  srsContent?: string;
  exactBudgetVnd?: number;
  durationMonths?: number;
  fromAiBrief?: boolean;
  deadline?: string;
};

const ConfirmProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const isFromAi = state.fromAiBrief || false;

  // Local states for AI quick-publish
  const [title, setTitle] = useState(state.projectName || '');
  const [category, setCategory] = useState(state.category || '');
  const [customCategory, setCustomCategory] = useState('');
  const [upgrades, setUpgrades] = useState(
    state.upgrades || { featured: false, urgent: false, warranty: false }
  );
  const defaultDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const [deadline, setDeadline] = useState(state.deadline || defaultDeadline);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalUpgradesCost = useMemo(() => {
    return (
      (upgrades.featured ? 59000 : 0) +
      (upgrades.urgent ? 99000 : 0) +
      (upgrades.warranty ? 59000 : 0)
    );
  }, [upgrades]);

  const handleConfirm = async () => {
    if (isFromAi) {
      if (!title.trim()) {
        setError('Vui lòng nhập tên dự án.');
        return;
      }
      if (!category) {
        setError('Vui lòng chọn danh mục dự án.');
        return;
      }
      if (category === 'Khác' && !customCategory.trim()) {
        setError('Vui lòng nhập tên danh mục cụ thể.');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const budget = state.exactBudgetVnd || state.budgetAmount || 1000000;
      const durationMonths = state.durationMonths || 3;

      const finalTitle = isFromAi ? title.trim() : state.projectName || 'Dự án mới';
      // Backend description logic: if from AI, we don't have a manual description, we can just say 'Xem chi tiết trong tài liệu SRS đính kèm.'
      const finalDesc = isFromAi
        ? 'Vui lòng xem chi tiết yêu cầu trong tài liệu đính kèm.'
        : state.description || 'Chưa có mô tả chi tiết.';

      const jobPayload = {
        title: finalTitle,
        description: finalDesc,
        budgetMin: budget,
        budgetMax: budget,
        estimatedDurationMonths: durationMonths,
        srsDocumentUrl: state.srsDocumentUrl || '',
        srsContent: state.srsContent || '',
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        isFeatured: upgrades.featured,
        isUrgentHiring: upgrades.urgent,
        requiresAiQa: upgrades.warranty,
      };

      const createdJob = await jobApi.createJob(jobPayload);

      navigate(PATH_CLIENT_SUCCESS_PROJECT, {
        state: {
          newProjectId: createdJob.id,
          jobData: createdJob,
        },
      });
    } catch (err: any) {
      console.error('Failed to create job:', err);
      setError(err?.message || 'Không thể tạo dự án. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <ClientDashboardHeader />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-100 w-full max-w-2xl flex flex-col">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isFromAi ? 'Hoàn tất Đăng Dự án' : 'Bạn có chắc chắn muốn đăng dự án này?'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isFromAi
                ? 'Chỉ cần thêm vài thông tin cơ bản, hệ thống sẽ tự động tìm kiếm chuyên gia cho bạn.'
                : 'Dự án sẽ được hiển thị cho các freelancer trên nền tảng.'}
            </p>
          </div>

          {error && (
            <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {isFromAi && (
            <div className="space-y-6 mb-8">
              {/* Thông tin chốt từ AI */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400 mb-1">
                      {'//'} HỢP ĐỒNG AI ĐÃ CHỐT
                    </h4>
                    <p className="text-xs text-slate-400">
                      Dữ liệu chính xác từ tài liệu SRS sau đàm phán
                    </p>
                  </div>
                  {/* Link SRS */}
                  {state.srsDocumentUrl ? (
                    <a
                      href={state.srsDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors shrink-0"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.293.707l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Xem tài liệu SRS
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 text-xs font-bold text-blue-100 cursor-not-allowed">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      SRS chưa sẵn sàng
                    </span>
                  )}
                </div>

                {/* Ngân sách + Thời gian */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
                    <div className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">
                      Ngân sách dự án
                    </div>
                    <div className="text-2xl font-black leading-tight">
                      {new Intl.NumberFormat('vi-VN').format(
                        state.exactBudgetVnd || state.budgetAmount || 0
                      )}{' '}
                      <span className="text-sm font-bold text-blue-100">VNĐ</span>
                    </div>
                    <div className="text-[11px] text-blue-200 mt-1">
                      Giá trị chính xác đã chốt với AI
                    </div>
                  </div>
                  <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
                    <div className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">
                      Thời gian thực hiện dự án
                    </div>
                    <div className="text-2xl font-black leading-tight">
                      {state.durationMonths}{' '}
                      <span className="text-sm font-bold text-blue-100">tháng</span>
                    </div>
                    <div className="text-[11px] text-blue-200 mt-1">
                      Thời gian hoàn thành dự kiến
                    </div>
                  </div>
                </div>
              </div>

              {/* Form bổ sung */}
              <div>
                <label
                  htmlFor="project-title"
                  className="block text-sm font-bold text-gray-900 mb-2"
                >
                  Tên dự án <span className="text-red-500">*</span>
                </label>
                <input
                  id="project-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Thiết kế App giao đồ ăn"
                  className="w-full p-4 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="project-category"
                  className="block text-sm font-bold text-gray-900 mb-2"
                >
                  Danh mục dự án <span className="text-red-500">*</span>
                </label>
                <select
                  id="project-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-4 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {category === 'Khác' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Nhập tên danh mục cụ thể..."
                    className="w-full mt-3 p-4 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none transition-all"
                  />
                )}
              </div>

              <div>
                <label
                  htmlFor="project-deadline"
                  className="block text-sm font-bold text-gray-900 mb-2"
                >
                  Hạn chót nhận ứng tuyển
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Sau ngày này, dự án sẽ tự động ngưng nhận hồ sơ. Tối đa 30 ngày kể từ hôm nay.
                </p>
                <input
                  type="date"
                  id="project-deadline"
                  value={deadline}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full sm:w-1/2 p-4 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Upgrades - Luôn hiện cho cả 2 luồng */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Các gói dịch vụ nâng cấp (Tùy chọn)
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={upgrades.featured}
                  onChange={(e) => setUpgrades({ ...upgrades, featured: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300"
                />
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900">Gói Nổi Bật</div>
                  <div className="text-xs text-gray-500">Ghim dự án lên top tìm kiếm</div>
                </div>
                <div className="font-bold text-blue-600 text-sm">+59.000 đ</div>
              </label>

              <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={upgrades.urgent}
                  onChange={(e) => setUpgrades({ ...upgrades, urgent: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300"
                />
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900">Gói Tuyển Gấp AI</div>
                  <div className="text-xs text-gray-500">
                    Hệ thống gửi thông báo trực tiếp đến Top 5 chuyên gia
                  </div>
                </div>
                <div className="font-bold text-blue-600 text-sm">+99.000 đ</div>
              </label>

              <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={upgrades.warranty}
                  onChange={(e) => setUpgrades({ ...upgrades, warranty: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300"
                />
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900">Trọng tài Code QA</div>
                  <div className="text-xs text-gray-500">
                    Bảo vệ source code an toàn trước khi nghiệm thu
                  </div>
                </div>
                <div className="font-bold text-blue-600 text-sm">+59.000 đ</div>
              </label>
            </div>

            {totalUpgradesCost > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100">
                <span className="text-sm font-medium text-gray-600">Tổng phí nâng cấp:</span>
                <span className="text-lg font-black text-blue-700">
                  {new Intl.NumberFormat('vi-VN').format(totalUpgradesCost)} đ
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 w-full border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() =>
                isFromAi
                  ? navigate(-1)
                  : navigate(PATH_CLIENT_POST_PROJECT, { state: { ...state, restoreStep: 4 } })
              }
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-1/3 h-[44px] rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="group relative flex items-center justify-center gap-2 flex-1 h-[44px] rounded-lg bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-medium text-sm border-t border-t-blue-400/30 shadow-xs btn-sweep active:scale-[0.97] transition-all cursor-pointer border-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>AI đang thiết lập dự án... (vui lòng chờ)</span>
                </>
              ) : totalUpgradesCost > 0 ? (
                'Thanh toán & Đăng dự án'
              ) : (
                'Xác nhận đăng dự án'
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConfirmProjectPage;
