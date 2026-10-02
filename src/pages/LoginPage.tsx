import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { type LoginFormData, loginSchema } from '../features/auth/schemas/login-schema';
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between items-center font-sans py-6 px-4 select-none relative">
      <Link
        to={paths.PATH_HOME}
        className="absolute top-6 left-6 md:top-10 md:left-10 text-sm font-bold text-gray-500 hover:text-[#1D4ED8] transition-colors flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Về trang chủ
      </Link>

      <div />

      {/* Main Login Card */}
      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 flex max-w-5xl w-full overflow-hidden min-h-[600px]">
        {/* Left Pane: Gradient Banner */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#00A3FF] via-[#1A83FF] to-[#1D4ED8] p-12 flex-col justify-start text-white relative">
          <div
            className="text-4xl font-black tracking-tighter mb-4"
            style={{ fontFamily: "'Quedora', sans-serif" }}
          >
            SAM
          </div>
          <p className="text-lg font-medium leading-relaxed opacity-90 max-w-xs">
            Kiến tạo tương lai cho việc kết nối khách hàng và freelancer
          </p>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-tl-full pointer-events-none" />
        </div>

        {/* Right Pane: Form Đăng Nhập */}
        <div className="w-full md:w-7/12 p-4 md:p-8 flex flex-col justify-center bg-white">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Chào mừng quay trở lại
          </h2>
          <p className="text-gray-500 text-sm mb-4 leading-relaxed max-w-md">
            Đăng nhập vào không gian làm việc SAM của bạn để tiếp tục kết nối.
          </p>

          {/* Alert Banner for expired or compromised sessions */}
          {reason === 'compromised' && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
            <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
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

          {/* Form Fields */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Email công việc
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl text-sm focus:outline-none transition ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-600">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl text-sm focus:outline-none transition ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-0"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                      className="h-5 w-5"
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
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="remember_me"
                className="ml-2 text-xs font-semibold text-gray-500 cursor-pointer select-none"
              >
                Duy trì đăng nhập
              </label>
            </div>

            {/* Login Button */}
            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-8/12 bg-gradient-to-r from-[#1D4ED8] to-[#00A3FF] hover:opacity-95 text-white font-bold py-3.5 rounded-full transition shadow-lg text-center disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
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
                  'Đăng nhập'
                )}
              </button>
            </div>
          </form>

          {/* Footer inside Card */}
          <div className="mt-8 text-center text-xs text-gray-500 font-medium">
            Mới sử dụng NỀN TẢNG SAM?{' '}
            <Link
              to={paths.PATH_REGISTER}
              className="text-blue-600 font-bold hover:underline ml-1 cursor-pointer bg-transparent border-0 p-0"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </div>

      {/* External Page Footer */}
      <footer className="flex space-x-6 text-xs text-gray-500 font-semibold mt-6">
        <button
          type="button"
          className="hover:text-gray-800 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Chính sách bảo mật
        </button>
        <button
          type="button"
          className="hover:text-gray-800 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Điều khoản dịch vụ
        </button>
        <button
          type="button"
          className="hover:text-gray-800 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Trung tâm trợ giúp
        </button>
      </footer>
    </div>
  );
};

export default LoginPage;
