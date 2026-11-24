import { type LoginFormData, loginSchema } from '@/features/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { CircleAlert, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';
import AuthLayout from '../layouts/AuthLayout';
import {
  clearGoogleLinkPending,
  googleAuthEnabled,
  setGoogleLinkPending,
} from '../lib/google-auth';
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
    </AuthLayout>
  );
};

export default LoginPage;
