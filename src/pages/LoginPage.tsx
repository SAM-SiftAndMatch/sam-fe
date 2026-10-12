import { type LoginFormData, loginSchema } from '@/features/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { InteractiveBackground } from '../components/landing/InteractiveBackground';
import { MonoTag } from '../components/landing/LandingButtons';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  const { login } = useAuthStore();
  const state = location.state as { returnTo?: string; initialQuery?: string } | null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const auth = await login(data);
      if (state?.returnTo) {
        navigate(state.returnTo, { state: { initialQuery: state.initialQuery } });
      } else if (auth.role === 'FREELANCER') {
        navigate(paths.PATH_FREELANCER);
      } else {
        navigate(paths.PATH_CLIENT_DASHBOARD);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
        setServerError(message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between items-center font-sans py-8 px-4 relative overflow-hidden select-none">
      {/* Interactive Background */}
      <InteractiveBackground />

      {/* Top Bar Link */}
      <div className="w-full max-w-5xl flex justify-start items-center z-10 mb-4">
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

      {/* Main Login Card (Modern 12-col layout) */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] border border-slate-200 grid grid-cols-1 md:grid-cols-12 max-w-5xl w-full overflow-hidden z-10 min-h-[580px]">
        {/* Left Pane: Tech Architecture & Value Overview */}
        <div className="hidden md:flex md:col-span-5 bg-slate-900 border-r border-slate-800 p-8 lg:p-10 flex-col justify-between text-white relative">
          <div>
            <div className="flex items-center justify-between mb-8">
              <span
                className="text-3xl font-black tracking-tight text-white"
                style={{ fontFamily: "'Quedora', sans-serif" }}
              >
                SAM
              </span>
              <MonoTag variant="muted">SECURE {'//'} AUTH</MonoTag>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
              Kiến tạo tương lai cho việc kết nối khách hàng & freelancer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Nền tảng freelance tích hợp bộ 3 động cơ AI: Phỏng vấn yêu cầu, tuyển chọn nhân tài và
              kiểm định chất lượng bàn giao.
            </p>

            {/* Live-looking architecture micro-snippet */}
            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <div className="text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                    01. AI PM Engine
                  </div>
                  <div className="text-slate-400 text-[11px] font-sans mt-0.5">
                    Tự động chuẩn hóa yêu cầu & đặc tả PRD chi tiết
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <div className="text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                    02. AI Matching Core
                  </div>
                  <div className="text-slate-400 text-[11px] font-sans mt-0.5">
                    Quét portfolio, tính điểm khớp năng lực & xếp hạng
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <div>
                  <div className="text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                    03. AI QC Pipeline
                  </div>
                  <div className="text-slate-400 text-[11px] font-sans mt-0.5">
                    Quét mã độc, lỗi bảo mật & đối soát tiêu chí trước nghiệm thu
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>ESCROW PROTECTED</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ACTIVE
            </span>
          </div>
        </div>

        {/* Right Pane: Login Form */}
        <div className="md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <div className="md:hidden mb-4 flex items-center justify-between">
              <span
                className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] via-[#0066FF] to-[#0AAAD7] leading-none"
                style={{ fontFamily: "'Quedora', sans-serif" }}
              >
                SAM
              </span>
              <MonoTag variant="primary">AUTH</MonoTag>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Chào mừng quay trở lại
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Đăng nhập vào không gian làm việc SAM của bạn để tiếp tục kết nối.
            </p>
          </div>

          {/* Alert Banner for expired or compromised sessions */}
          {reason === 'compromised' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Phát hiện token bất thường. Để bảo vệ an toàn, toàn bộ phiên đăng nhập đã được chấm
                dứt. Vui lòng đăng nhập lại.
              </span>
            </div>
          )}

          {reason === 'session_expired' && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.</span>
            </div>
          )}

          {/* Backend error message */}
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
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email công việc
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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
                  placeholder="ten@congty.com"
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
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-slate-200 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      role="img"
                      aria-label="Hide password"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      role="img"
                      aria-label="Show password"
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
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center pt-1">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#1D4ED8] border-slate-300 rounded focus:ring-[#1D4ED8] cursor-pointer"
              />
              <label
                htmlFor="remember_me"
                className="ml-2 text-xs font-medium text-slate-600 cursor-pointer select-none"
              >
                Duy trì đăng nhập
              </label>
            </div>

            {/* Login Button (Tech button: 8px radius, 44px height, bevel top border, btn-sweep, arrow slide) */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full h-[44px] bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg border-t border-t-blue-400/30 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] btn-sweep"
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
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer inside Card */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
            Mới sử dụng NỀN TẢNG SAM?{' '}
            <Link
              to={paths.PATH_REGISTER}
              className="text-[#1D4ED8] font-semibold hover:underline ml-1 cursor-pointer"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </div>

      {/* External Page Footer */}
      <footer className="flex flex-wrap justify-center items-center gap-6 text-xs text-slate-500 font-medium mt-6 z-10">
        <button
          type="button"
          className="hover:text-slate-800 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Chính sách bảo mật
        </button>
        <span className="text-slate-300">•</span>
        <button
          type="button"
          className="hover:text-slate-800 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Điều khoản dịch vụ
        </button>
        <span className="text-slate-300">•</span>
        <button
          type="button"
          className="hover:text-slate-800 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Trung tâm trợ giúp
        </button>
      </footer>
    </div>
  );
};

export default LoginPage;
