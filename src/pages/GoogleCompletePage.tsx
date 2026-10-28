import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { clearGoogleRole, getGoogleRole } from '../lib/google-auth';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

export default function GoogleCompletePage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [role, setRole] = useState<'CLIENT' | 'FREELANCER'>(getGoogleRole);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const auth = await authApi.completeGoogle(role);
      clearGoogleRole();
      setUser({ userId: auth.userId, email: auth.email, fullName: auth.fullName, role: auth.role });
      navigate(
        role === 'FREELANCER' ? paths.PATH_FREELANCER_CREATE_PROFILE : paths.PATH_CLIENT_PROFILE,
        { replace: true }
      );
    } catch {
      setError('Không hoàn tất được đăng ký Google. Vui lòng thử lại từ trang đăng nhập.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Hoàn tất đăng ký bằng Google</h1>
        <p className="mt-2 text-sm text-slate-600">Chọn vai trò bạn sẽ sử dụng trên SAM.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('CLIENT')}
            className={`rounded-lg border p-4 text-sm font-semibold cursor-pointer ${role === 'CLIENT' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            Khách hàng
          </button>
          <button
            type="button"
            onClick={() => setRole('FREELANCER')}
            className={`rounded-lg border p-4 text-sm font-semibold cursor-pointer ${role === 'FREELANCER' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            Freelancer
          </button>
        </div>
        <label className="mt-5 flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1"
          />
          <span>Tôi đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của SAM.</span>
        </label>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={complete}
          disabled={submitting || !acceptedTerms}
          className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký'}
        </button>
      </div>
    </main>
  );
}
