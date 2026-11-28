import { type LoginFormData, loginSchema } from '@/features/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { CircleAlert, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';
import AuthLayout from '../layouts/AuthLayout';
import {
  clearGoogleLinkPending,
  googleAuthEnabled,
  setGoogleLinkPending,
} from '../lib/google-auth';
import { SUPPORT_FACEBOOK_URL } from '../lib/support';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    if (!forgotOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setForgotOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [forgotOpen]);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const googleError = searchParams.get('google_error');
  const googleLink = searchParams.get('google_link') === '1';

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
      if (googleLink) setGoogleLinkPending();
      const auth = await login({ ...data, rememberMe });
      if (googleLink) {
        navigate(paths.PATH_GOOGLE_AUTH_LINK, { replace: true });
        return;
      }
      if (state?.returnTo) {
        navigate(state.returnTo, { state: { initialQuery: state.initialQuery } });
      } else if (auth.role === 'FREELANCER') {
        navigate(paths.PATH_FREELANCER);
      } else {
        navigate(paths.PATH_CLIENT_DASHBOARD);
      }
    } catch (err: unknown) {
      if (googleLink) clearGoogleLinkPending();
      if (axios.isAxiosError(err)) {
        const raw = err.response?.data?.message as string | undefined;
        const message =
          raw === 'Email or password is incorrect'
            ? 'Email hoặc mật khẩu không chính xác.'
            : raw || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
        setServerError(message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      footer={
        <>
          Chưa có tài khoản? <Link to={paths.PATH_REGISTER}>Đăng ký miễn phí</Link>
        </>
      }
    >
      {reason === 'compromised' && (
        <div className="auth-notice auth-notice--error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <p>Để bảo vệ tài khoản, các phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.</p>
        </div>
      )}
      {reason === 'session_expired' && (
        <div className="auth-notice auth-notice--warning" aria-live="polite">
          <CircleAlert size={18} aria-hidden="true" />
          <p>Phiên đăng nhập đã hết hạn. Đăng nhập lại để tiếp tục nhé.</p>
        </div>
      )}
      {googleLink && (
        <div className="auth-notice auth-notice--info" aria-live="polite">
          <CircleAlert size={18} aria-hidden="true" />
          <p>Email này đã có tài khoản SAM. Hãy đăng nhập bằng mật khẩu SAM để liên kết Google.</p>
        </div>
      )}
      {googleError && (
        <div className="auth-notice auth-notice--error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <p>
            {googleError === 'cancelled'
              ? 'Bạn đã hủy đăng nhập Google.'
              : 'Không hoàn tất được đăng nhập Google. Vui lòng thử lại.'}
          </p>
        </div>
      )}
      {serverError && (
        <div className="auth-notice auth-notice--error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <p>{serverError}</p>
        </div>
      )}

      {googleAuthEnabled && (
        <div className="auth-google">
          <GoogleLoginButton
            rememberMe={rememberMe}
            returnTo={state?.returnTo}
            initialQuery={state?.initialQuery}
          />
          <div className="auth-divider">
            <span>hoặc tiếp tục với email</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'auth-email-error' : undefined}
            {...register('email')}
            placeholder="ban@example.com"
            className="auth-input"
          />
          {errors.email && (
            <p id="auth-email-error" className="auth-field-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="password">Mật khẩu</label>
          <div className="auth-password">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'auth-password-error' : undefined}
              {...register('password')}
              placeholder="Nhập mật khẩu của bạn"
              className="auth-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={showPassword}
              className="auth-password-toggle"
            >
              {showPassword ? (
                <EyeOff size={19} aria-hidden="true" />
              ) : (
                <Eye size={19} aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="auth-password-error" className="auth-field-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <label className="auth-remember" htmlFor="remember_me">
            <input
              id="remember_me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
            />
            <span>Duy trì đăng nhập</span>
          </label>
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-xs font-semibold text-[#1D4ED8] hover:underline bg-transparent border-0 p-0 cursor-pointer"
          >
            Quên mật khẩu?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle size={19} className="auth-spinner" aria-hidden="true" />
              <span aria-live="polite">Đang đăng nhập...</span>
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setForgotOpen(false);
          }}
        >
          <dialog
            open
            aria-modal="true"
            aria-label="Hỗ trợ quên mật khẩu"
            className="relative m-0 w-full max-w-md rounded-2xl border-0 bg-white p-6 text-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-bold text-slate-900">Quên mật khẩu?</h2>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Hệ thống hiện chưa mở tự động đặt lại mật khẩu qua email. Nếu bạn đã liên kết Google,
              hãy dùng nút <strong>Tiếp tục với Google</strong> để đăng nhập.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Trường hợp cần cấp lại quyền truy cập tài khoản email, vui lòng liên hệ trực tiếp đội
              ngũ hỗ trợ SAM:
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href={SUPPORT_FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#153bb5] transition-colors"
              >
                Liên hệ hỗ trợ SAM
              </a>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-white"
              >
                Đóng
              </button>
            </div>
          </dialog>
        </div>
      )}
    </AuthLayout>
  );
};

export default LoginPage;
