import { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { takeGoogleReturnTo } from '../lib/google-auth';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';

export default function GoogleAuthReturnPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const linked = params.get('linked') === '1';
  const redirected = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user || linked || redirected.current) return;
    redirected.current = true;
    const destination = takeGoogleReturnTo();
    if (destination) {
      navigate(destination.returnTo, {
        replace: true,
        state: { initialQuery: destination.initialQuery },
      });
    } else {
      navigate(user.role === 'FREELANCER' ? paths.PATH_FREELANCER : paths.PATH_CLIENT_DASHBOARD, {
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, linked, navigate, user]);

  if (isLoading) return <LoadingScreen />;

  const home = user?.role === 'FREELANCER' ? paths.PATH_FREELANCER : paths.PATH_CLIENT_DASHBOARD;
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          {isAuthenticated
            ? 'Đã liên kết tài khoản Google'
            : 'Không hoàn tất được đăng nhập Google'}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {isAuthenticated
            ? 'Bạn có thể đăng nhập SAM bằng tài khoản Google này.'
            : 'Vui lòng thử đăng nhập lại.'}
        </p>
        <Link
          to={isAuthenticated ? home : paths.PATH_LOGIN}
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          {isAuthenticated ? 'Tiếp tục' : 'Về trang đăng nhập'}
        </Link>
      </div>
    </main>
  );
}
