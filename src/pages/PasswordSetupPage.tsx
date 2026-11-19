import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { type PasswordSetupStatus, authApi } from '../api/auth';
import {
  Field,
  Notice,
  inputClass,
  primaryClass,
  secondaryClass,
} from '../components/finance/FinanceUI';
import { extractApiResponse, getApiErrorMessage } from '../lib/api-error';
import {
  PASSWORD_SETUP_RETURN_KEY,
  passwordSetupReturnTo,
  passwordSetupValidation,
} from '../lib/password-setup';
import { useAuthStore } from '../stores/useAuthStore';

export default function PasswordSetupPage() {
  const user = useAuthStore((state) => state.user);
  const [params] = useSearchParams();
  const cache = useQueryClient();
  const [returnTo] = useState(() => {
    let remembered: string | null = null;
    try {
      remembered = sessionStorage.getItem(PASSWORD_SETUP_RETURN_KEY);
    } catch {
      // Storage is optional: the user can still return to the bank account list.
    }
    return passwordSetupReturnTo(params.get('returnTo') ?? remembered, user?.role);
  });
  useEffect(() => {
    try {
      sessionStorage.removeItem(PASSWORD_SETUP_RETURN_KEY);
    } catch {
      // Storage is optional.
    }
  }, []);
  const queryKey = ['password-setup', user?.userId];
  const status = useQuery({ queryKey, queryFn: authApi.passwordSetupStatus, retry: false });
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const callbackError = params.get('error');
  const backLabel = user?.role === 'FREELANCER' ? 'Quay lại tài khoản nhận tiền' : 'Quay lại';

  const confirmGoogle = async () => {
    setBusy(true);
    setError('');
    try {
      const url = await authApi.startPasswordSetup();
      try {
        sessionStorage.setItem(PASSWORD_SETUP_RETURN_KEY, returnTo);
      } catch {
        // Do not make credential enrollment depend on browser storage.
      }
      window.location.assign(url);
    } catch (cause) {
      setError(
        getApiErrorMessage(
          extractApiResponse(cause),
          'Không bắt đầu được xác nhận Google. Vui lòng thử lại.'
        )
      );
      setBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = passwordSetupValidation(password, confirmation);
    setError(invalid);
    if (invalid) return;
    setBusy(true);
    try {
      await authApi.setupPassword(password, confirmation);
      setSuccess(true);
      cache.setQueryData<PasswordSetupStatus>(queryKey, {
        hasPassword: true,
        canSetup: false,
        googleConfirmed: false,
      });
    } catch (cause) {
      setError(
        getApiErrorMessage(
          extractApiResponse(cause),
          'Không thiết lập được mật khẩu SAM. Vui lòng thử lại.'
        )
      );
      // A consumed/expired proof must lead back to Google confirmation, never a dead form.
      await status.refetch();
    } finally {
      setPassword('');
      setConfirmation('');
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Thiết lập mật khẩu SAM</h1>
        <p className="text-sm leading-6 text-slate-600">
          Tạo mật khẩu SAM để xác thực khi thêm tài khoản ngân hàng và thực hiện giao dịch. Sau khi
          thiết lập, bạn có thể đăng nhập SAM bằng Google hoặc email và mật khẩu này. Mật khẩu
          Google của bạn không thay đổi.
        </p>
        {status.isPending && (
          <output className="block text-sm text-slate-600">Đang kiểm tra tài khoản...</output>
        )}
        {status.isError && (
          <>
            <Notice error>Không tải được trạng thái mật khẩu. Vui lòng thử lại.</Notice>
            <button type="button" className={secondaryClass} onClick={() => void status.refetch()}>
              Thử lại
            </button>
          </>
        )}
        {success ? (
          <Notice>
            Đã thiết lập mật khẩu SAM thành công. Bạn có thể quay lại và nhập mật khẩu vừa tạo để
            xác thực thêm tài khoản ngân hàng.
          </Notice>
        ) : !status.isError && status.data?.hasPassword ? (
          <Notice>
            Tài khoản đã có mật khẩu SAM. Hãy dùng mật khẩu đó để xác thực. Trang này chỉ dành cho
            việc thiết lập mật khẩu lần đầu.
          </Notice>
        ) : !status.isError && status.data?.canSetup ? (
          <>
            {status.data.googleConfirmed ? (
              <form onSubmit={(event) => void submit(event)} className="space-y-4">
                <p className="text-sm text-green-700">
                  Đã xác nhận tài khoản Google. Hãy tạo mật khẩu SAM trong vòng 5 phút kể từ khi xác
                  nhận.
                </p>
                <Field
                  label="Mật khẩu SAM mới"
                  hint="Ít nhất 8 ký tự. Nên dùng mật khẩu riêng cho SAM."
                >
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={busy}
                    className={inputClass}
                  />
                </Field>
                <Field label="Nhập lại mật khẩu SAM mới">
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    maxLength={72}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    disabled={busy}
                    className={inputClass}
                  />
                </Field>
                <button type="submit" className={`${primaryClass} w-full`} disabled={busy}>
                  {busy ? 'Đang lưu...' : 'Thiết lập mật khẩu'}
                </button>
              </form>
            ) : (
              <>
                <p className="text-sm leading-6 text-slate-600">
                  Trước tiên, hãy chọn đúng tài khoản Google đã liên kết với tài khoản SAM{' '}
                  {user?.email}.
                </p>
                {callbackError && !error && (
                  <Notice error>
                    {callbackError === 'cancelled'
                      ? 'Bạn đã hủy xác nhận Google. Có thể thử lại khi sẵn sàng.'
                      : 'Không xác nhận được Google. Hãy chọn đúng tài khoản đã liên kết với SAM và thử lại.'}
                  </Notice>
                )}
                <button
                  type="button"
                  className={`${primaryClass} w-full`}
                  disabled={busy}
                  onClick={() => void confirmGoogle()}
                >
                  {busy ? 'Đang chuyển đến Google...' : 'Xác nhận tài khoản Google'}
                </button>
              </>
            )}
          </>
        ) : (
          !status.isPending &&
          !status.isError && (
            <Notice error>Tài khoản này chưa đủ điều kiện thiết lập mật khẩu bằng Google.</Notice>
          )
        )}
        {error && <Notice error>{error}</Notice>}
        {!busy && (
          <Link
            to={returnTo}
            className="block text-center text-sm font-semibold text-blue-700 hover:underline"
          >
            {backLabel}
          </Link>
        )}
      </div>
    </main>
  );
}
