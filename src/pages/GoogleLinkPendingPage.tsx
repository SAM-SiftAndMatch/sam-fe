import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { clearGoogleLinkPending } from '../lib/google-auth';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

export default function GoogleLinkPendingPage() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'ready' | 'loading' | 'success' | 'error'>('ready');
  const role = useAuthStore((state) => state.user?.role);

  const link = async () => {
    setStatus('loading');
    try {
      await authApi.linkGooglePending(password);
      clearGoogleLinkPending();
      setPassword('');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Liên kết tài khoản Google</h1>
        <p className="mt-3 text-sm text-slate-600">
          {status === 'success'
            ? 'Đã liên kết Google với tài khoản SAM của bạn.'
            : 'Xác nhận mật khẩu SAM để liên kết tài khoản Google vừa chọn.'}
        </p>
        {status !== 'success' && (
          <>
            <label
              htmlFor="sam-link-password"
              className="mt-5 block text-left text-sm font-medium text-slate-700"
            >
              Mật khẩu SAM
            </label>
            <input
              id="sam-link-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900"
            />
            {status === 'error' && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                Không thể liên kết. Kiểm tra mật khẩu hoặc thử đăng nhập Google lại.
              </p>
            )}
            <button
              type="button"
              onClick={link}
              disabled={!password || status === 'loading'}
              className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {status === 'loading' ? 'Đang liên kết...' : 'Xác nhận liên kết'}
            </button>
          </>
        )}
        <Link
          to={role === 'FREELANCER' ? paths.PATH_FREELANCER : paths.PATH_CLIENT_DASHBOARD}
          onClick={clearGoogleLinkPending}
          className="mt-6 block text-sm font-semibold text-blue-700 hover:underline"
        >
          {status === 'success' ? 'Tiếp tục' : 'Để sau'}
        </Link>
      </div>
    </main>
  );
}
