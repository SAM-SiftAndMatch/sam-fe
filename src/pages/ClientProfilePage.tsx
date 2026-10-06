import { type ClientProfileFormData, clientProfileSchema } from '@/features/profile';
import { MyPackagesSection } from '@/features/subscription';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/profile';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

const ClientProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ClientProfileFormData>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      companyName: '',
      industry: '',
      websiteUrl: '',
      description: '',
    },
  });

  const descriptionValue = watch('description') ?? '';

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const data = await profileApi.getClientProfile();
        if (isMounted && data) {
          setIsNewProfile(!data.id);
          reset({
            companyName: data.companyName || '',
            industry: data.industry || '',
            websiteUrl: data.websiteUrl || '',
            description: data.description || '',
          });
        }
      } catch (err: unknown) {
        console.warn('Client profile fetch failed:', err);
        if (isMounted) {
          setIsNewProfile(true);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [reset]);

  const onSubmit = async (data: ClientProfileFormData) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      await profileApi.updateClientProfile({
        companyName: data.companyName.trim(),
        industry: data.industry?.trim() || null,
        websiteUrl: data.websiteUrl?.trim() || null,
        description: data.description?.trim() || null,
      });

      setIsNewProfile(false);
      setSuccessMessage('Hồ sơ công ty đã được lưu và cập nhật thành công!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          'Không thể cập nhật hồ sơ. Vui lòng kiểm tra lại thông tin.';
        setServerError(message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Đã xảy ra lỗi, vui lòng thử lại sau.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full h-16 px-6 md:px-10 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
        <div
          onClick={() => navigate(paths.PATH_CLIENT_DASHBOARD)}
          className="flex items-center gap-1 cursor-pointer group"
        >
          <div
            className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] group-hover:from-[#0AAAD7] group-hover:to-[#1D4ED8] transition-all duration-300"
            style={{ fontFamily: "'Quedora', sans-serif" }}
          >
            SAM
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(paths.PATH_CLIENT_DASHBOARD)}
            className="text-gray-500 hover:text-gray-900 font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer border-0 text-sm"
          >
            Thoát
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 md:px-8 py-8 mb-24 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto">
          {/* Notification Banners */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3 shadow-sm">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-3 shadow-sm">
              <svg
                className="w-5 h-5 flex-shrink-0 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {isNewProfile && !isLoadingProfile && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-2xl shadow-sm">
              Chào mừng bạn! Hãy hoàn thiện hồ sơ công ty để bắt đầu đăng dự án tuyển dụng.
            </div>
          )}

          {isLoadingProfile ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#0047FF] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Đang tải hồ sơ công ty...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Card */}
              <div className="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-10 space-y-8">
                {/* Section 1: Identity Header (read-only) */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-gray-100">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#1D4ED8] to-[#00A3FF] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md shrink-0">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'CL'}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {user?.fullName || 'Client'}
                      </h1>
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 w-fit self-center sm:self-auto">
                        Tài khoản Client
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 pt-1">
                      Thông tin tài khoản do hệ thống quản lý. Hồ sơ công ty bên dưới dùng để hiển
                      thị với Freelancer khi đăng tuyển.
                    </p>
                  </div>
                </div>

                {/* Section 2: Company Name & Industry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
                    >
                      Tên công ty <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      {...register('companyName')}
                      placeholder="VD: Công ty ABC"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition ${
                        errors.companyName
                          ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                          : 'border-gray-200 focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] bg-gray-50/40 focus:bg-white'
                      }`}
                    />
                    {errors.companyName && (
                      <p className="mt-1.5 text-xs text-red-500">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="industry"
                      className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
                    >
                      Lĩnh vực hoạt động
                    </label>
                    <input
                      id="industry"
                      type="text"
                      {...register('industry')}
                      placeholder="VD: Fintech"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] bg-gray-50/40 focus:bg-white transition"
                    />
                    {errors.industry && (
                      <p className="mt-1.5 text-xs text-red-500">{errors.industry.message}</p>
                    )}
                  </div>
                </div>

                {/* Section 3: Website */}
                <div>
                  <label
                    htmlFor="websiteUrl"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
                  >
                    Website công ty
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </span>
                    <input
                      id="websiteUrl"
                      type="url"
                      {...register('websiteUrl')}
                      placeholder="https://company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] bg-gray-50/40 focus:bg-white transition"
                    />
                  </div>
                  {errors.websiteUrl && (
                    <p className="mt-1 text-xs text-red-500">{errors.websiteUrl.message}</p>
                  )}
                </div>

                {/* Section 4: Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="description"
                      className="block text-xs font-bold uppercase tracking-wider text-gray-700"
                    >
                      Mô tả công ty
                    </label>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {descriptionValue.length}/2000
                    </span>
                  </div>
                  <textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    placeholder="Mô tả quy mô, lĩnh vực và văn hóa công ty để thu hút Freelancer phù hợp..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] bg-gray-50/40 focus:bg-white transition resize-y"
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                  )}
                </div>
              </div>

              {/* Bottom Fixed Action Bar */}
              <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 md:px-10 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-40">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(paths.PATH_CLIENT_DASHBOARD)}
                    className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-900 transition-colors px-4 py-2 cursor-pointer border-0 bg-transparent text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
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
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:opacity-95 text-white font-semibold text-sm px-8 py-3 rounded-full hover:shadow-[0_8px_25px_rgba(0,178,255,0.4)] transition-all disabled:opacity-50 cursor-pointer border-0 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <span>{isDirty ? 'Lưu thay đổi' : 'Cập nhật hồ sơ'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
          <div className="mt-6">
            <MyPackagesSection pricingPath={paths.PATH_CLIENT_PRICING} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientProfilePage;
