import { type RegisterFormData, registerSchema } from '@/features/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { InteractiveBackground } from '../components/landing/InteractiveBackground';
import { MonoTag } from '../components/landing/LandingButtons';
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
          className="text-xs font-mono font-medium text-slate-600 hover:text-[#1D4ED8] transition-colors flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-lg shadow-xs border border-slate-200 hover:border-slate-300"
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
            <span
              className="text-3xl sm:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] via-[#0066FF] to-[#0AAAD7] leading-none"
              style={{ fontFamily: "'Quedora', sans-serif" }}
            >
              SAM
            </span>
            <MonoTag variant="primary">REGISTER</MonoTag>
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

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-200" />
          <span className="mx-3 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            HOẶC ĐĂNG KÝ BẰNG
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className="h-[40px] flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" role="img" aria-label="Google">
              <path
                fill="#EA4335"
                d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.97 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.74 2.9C5.91 7.23 8.71 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.45 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.42c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.52z"
              />
              <path
                fill="#FBBC05"
                d="M5.04 14.82c-.24-.72-.38-1.49-.38-2.32s.14-1.6.38-2.32L1.3 7.28C.47 8.94 0 10.79 0 12.72s.47 3.78 1.3 5.44l3.74-2.94z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.29 0-6.09-2.19-7.08-5.58L1.18 15.7C3.15 19.7 7.21 23 12 23z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="h-[40px] flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer text-slate-800"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" role="img" aria-label="Apple">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z" />
            </svg>
          </button>
          <button
            type="button"
            className="h-[40px] flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
          >
            <svg
              className="w-4 h-4 fill-[#0A66C2]"
              viewBox="0 0 24 24"
              role="img"
              aria-label="LinkedIn"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </button>
        </div>

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
          <span className="font-mono text-[11px]">ĐƯỢC TIN DÙNG BỞI HÀNG TRĂM DOANH NGHIỆP</span>
        </div>
        <p className="text-[11px] font-mono text-slate-400">
          © 2026 SAM AI Matching. Công nghệ kết nối nhân tài tương lai.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
