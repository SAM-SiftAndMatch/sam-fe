import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

export default function GoogleConnectPage() {
  const role = useAuthStore((state) => state.user?.role);
  const [linked, setLinked] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authApi
      .googleLinkStatus()
      .then(setLinked)
      .catch(() => setError('Không tải được trạng thái liên kết Google.'));
  }, []);

  const connect = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const url = await authApi.startGoogleLink(password);
      window.location.assign(url);
    } catch {
      setError('Không thể liên kết Google. Vui lòng kiểm tra mật khẩu SAM và thử lại.');
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Liên kết Google</h1>
        {linked === null && !error && <p className="mt-3 text-sm text-slate-600">Đang tải...</p>}
        {linked && (
          <p className="mt-3 text-sm text-green-700">Tài khoản SAM này đã liên kết Google.</p>
        )}
        {linked === false && (
          <>
            <p className="mt-3 text-sm text-slate-600">
              Nhập mật khẩu SAM để xác nhận, sau đó chọn tài khoản Google muốn liên kết.
            </p>
            <label
              htmlFor="sam-google-link-password"
              className="mt-6 block text-sm font-medium text-slate-700"
            >
              Mật khẩu SAM
            </label>
            <input
              id="sam-google-link-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900"
            />
            <button
              type="button"
              onClick={connect}
              disabled={submitting || !password}
              className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Đang chuyển đến Google...' : 'Liên kết Google'}
            </button>
          </>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <Link
          to={role === 'FREELANCER' ? paths.PATH_FREELANCER : paths.PATH_CLIENT_DASHBOARD}
          className="mt-6 block text-center text-sm font-semibold text-blue-700 hover:underline"
        >
          Quay lại
        </Link>
      </div>
    </main>
  );
}
