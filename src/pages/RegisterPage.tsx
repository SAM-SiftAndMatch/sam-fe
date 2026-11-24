import { type RegisterFormData, registerSchema } from '@/features/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { BriefcaseBusiness, CircleAlert, Eye, EyeOff, LoaderCircle, UserRound } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';
import PolicyLinks from '../components/PolicyLinks';
import AuthLayout from '../layouts/AuthLayout';
import { googleAuthEnabled } from '../lib/google-auth';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

const RegisterPage: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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
        acceptedTerms: data.agreeTerms,
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
    <AuthLayout
      title="Đăng kí"
      description="Tạo tài khoản để bắt đầu kết nối và cộng tác."
      footer={
        <>
          Đã có tài khoản? <Link to={paths.PATH_LOGIN}>Đăng nhập ngay</Link>
        </>
      }
    >
      <fieldset className="auth-account-types" disabled={isSubmitting}>
        <legend className="sr-only">Loại tài khoản</legend>
        <button
          type="button"
          className="auth-account-type"
          aria-pressed={selectedAccountType === 'CLIENT'}
          onClick={() => setValue('accountType', 'CLIENT', { shouldValidate: true })}
        >
          <BriefcaseBusiness size={19} aria-hidden="true" />
          <span>Khách hàng</span>
        </button>
        <button
          type="button"
          className="auth-account-type"
          aria-pressed={selectedAccountType === 'FREELANCER'}
          onClick={() => setValue('accountType', 'FREELANCER', { shouldValidate: true })}
        >
          <UserRound size={19} aria-hidden="true" />
          <span>Freelancer</span>
        </button>
      </fieldset>

      {serverError && (
        <div className="auth-notice auth-notice--error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <p>{serverError}</p>
        </div>
      )}

      {googleAuthEnabled && (
        <div className="auth-google">
          <GoogleLoginButton role={selectedAccountType} />
          <div className="auth-divider">
            <span>hoặc tiếp tục với email</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <div className="auth-field">
          <label htmlFor="fullName">Họ và tên</label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'register-name-error' : undefined}
            {...register('fullName')}
            placeholder="Nguyễn Văn A"
            className="auth-input"
          />
          {errors.fullName && (
            <p id="register-name-error" className="auth-field-error" role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            {...register('email')}
            placeholder="ban@example.com"
            className="auth-input"
          />
          {errors.email && (
            <p id="register-email-error" className="auth-field-error" role="alert">
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
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
              {...register('password')}
              placeholder="Nhập mật khẩu của bạn"
              className="auth-input"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={19} aria-hidden="true" />
              ) : (
                <Eye size={19} aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="register-password-error" className="auth-field-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="auth-consent">
          <div className="auth-terms">
            <input
              id="terms"
              type="checkbox"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.agreeTerms)}
              aria-describedby={errors.agreeTerms ? 'register-terms-error' : undefined}
              {...register('agreeTerms')}
            />
            <div>
              <label htmlFor="terms">Tôi đồng ý với </label>
              <PolicyLinks />
              <label htmlFor="terms"> của SAM.</label>
            </div>
          </div>
          {errors.agreeTerms && (
            <p id="register-terms-error" className="auth-field-error" role="alert">
              {errors.agreeTerms.message}
            </p>
          )}
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
              <span aria-live="polite">Đang tạo tài khoản...</span>
            </>
          ) : (
            'Tạo tài khoản'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
