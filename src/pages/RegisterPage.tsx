import { type RegisterFormData, registerSchema } from '@/features/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';
import SamBrandLogo from '../components/SamBrandLogo';
import { InteractiveBackground } from '../components/landing/InteractiveBackground';
import { googleAuthEnabled } from '../lib/google-auth';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

const RegisterPage: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { accountType?: 'CLIENT' | 'FREELANCER' } | null;
  const { register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: state?.accountType || 'CLIENT',
      fullName: '',
      email: '',
      password: '',
      agreeTerms: false,
    },
  });

  const selectedAccountType = watch('accountType');

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const auth = await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        accountType: data.accountType,
      });

      if (auth.role === 'FREELANCER') {
        navigate(paths.PATH_FREELANCER_CREATE_PROFILE);
      } else {
        navigate(paths.PATH_CLIENT_PROFILE);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.';
        setServerError(message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans py-10 px-4 relative overflow-hidden">
      {/* Interactive Background */}
      <InteractiveBackground />

      {/* Top Bar Link */}
      <div className="w-full max-w-[540px] flex justify-start items-center z-10 mb-4">
        <Link
          to={paths.PATH_HOME}
          className="text-xs font-medium text-slate-600 hover:text-[#1D4ED8] transition-colors flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-lg shadow-xs border border-slate-200 hover:border-slate-300"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          ← VỀ TRANG CHỦ
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] w-full max-w-[540px] p-6 sm:p-10 border border-slate-200 z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-2 mb-3">
            <SamBrandLogo />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">
            Khám phá tương lai công việc
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Tham gia mạng lưới nhân tài AI hàng đầu thế giới ngay hôm nay
          </p>
        </div>

        {/* Account Type Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setValue('accountType', 'CLIENT', { shouldValidate: true })}
            className={`py-3.5 px-3 flex flex-col items-center justify-center gap-1.5 border rounded-lg transition-all cursor-pointer ${
              selectedAccountType === 'CLIENT'
                ? 'border-[#1D4ED8] bg-blue-50/60 text-[#1D4ED8] ring-1 ring-[#1D4ED8]'
                : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              role="img"
              aria-label="Client icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-semibold">Khách Hàng</span>
          </button>

          <button
            type="button"
            onClick={() => setValue('accountType', 'FREELANCER', { shouldValidate: true })}
            className={`py-3.5 px-3 flex flex-col items-center justify-center gap-1.5 border rounded-lg transition-all cursor-pointer ${
              selectedAccountType === 'FREELANCER'
                ? 'border-[#1D4ED8] bg-blue-50/60 text-[#1D4ED8] ring-1 ring-[#1D4ED8]'
                : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              role="img"
              aria-label="Freelancer icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-xs font-semibold">Freelancer</span>
          </button>
        </div>

        {/* Server error message */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Họ và Tên
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  role="img"
                  aria-label="User icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <input
                id="fullName"
                type="text"
                {...register('fullName')}
                placeholder="Nguyễn Văn A"
                className={`w-full pl-10 pr-3.5 py-2.5 border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition ${
                  errors.fullName
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-slate-200 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  role="img"
                  aria-label="Email icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@vi-du.com"
                className={`w-full pl-10 pr-3.5 py-2.5 border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-slate-200 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]'
                }`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  role="img"
                  aria-label="Password icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={`w-full pl-10 pr-3.5 py-2.5 border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition ${
                  errors.password
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-slate-200 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="pt-1">
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                {...register('agreeTerms')}
                className="mt-0.5 w-4 h-4 text-[#1D4ED8] border-slate-300 rounded focus:ring-[#1D4ED8] cursor-pointer"
              />
              <div className="ml-2 text-xs text-slate-600 leading-relaxed">
                <label htmlFor="terms" className="cursor-pointer select-none">
                  Tôi đồng ý với{' '}
                </label>
                <button
                  type="button"
                  className="text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0 p-0 font-medium"
                >
                  Điều khoản Dịch vụ
                </button>
                <span> và </span>
                <button
                  type="button"
                  className="text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0 p-0 font-medium"
                >
                  Chính sách Bảo mật
                </button>
                <label htmlFor="terms" className="cursor-pointer select-none">
                  {' '}
                  của SAM.
                </label>
              </div>
            </div>
            {errors.agreeTerms && (
              <p className="mt-1 text-xs text-red-500">{errors.agreeTerms.message}</p>
            )}
          </div>

          {/* Submit Button (Tech button: 8px radius, 44px height, bevel top, btn-sweep, arrow slide) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full h-[44px] bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg border-t border-t-blue-400/30 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] btn-sweep"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Tạo Tài Khoản</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {googleAuthEnabled && (
          <>
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-slate-200" />
              <span className="mx-3 text-[11px] text-slate-400 uppercase tracking-wider">
                HOẶC ĐĂNG KÝ BẰNG
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>
            <GoogleLoginButton role={selectedAccountType} />
          </>
        )}

        {/* Under Card Links */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
          Đã có tài khoản?{' '}
          <Link
            to={paths.PATH_LOGIN}
            className="text-[#1D4ED8] font-semibold hover:underline ml-1 cursor-pointer"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>

      {/* Trust Badges & Copyright Footer */}
      <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-[540px] z-10 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="text-[11px]">ĐƯỢC TIN DÙNG BỞI HÀNG TRĂM DOANH NGHIỆP</span>
        </div>
        <p className="text-[11px] text-slate-400">
          © 2026 SAM AI Matching. Công nghệ kết nối nhân tài tương lai.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
