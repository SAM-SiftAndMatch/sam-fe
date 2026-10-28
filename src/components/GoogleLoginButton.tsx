import {
  googleAuthEnabled,
  googleAuthStartUrl,
  rememberGoogleReturnTo,
  rememberGoogleRole,
} from '../lib/google-auth';

interface GoogleLoginButtonProps {
  role?: 'CLIENT' | 'FREELANCER';
  returnTo?: string;
  initialQuery?: string;
}

export default function GoogleLoginButton({
  role,
  returnTo,
  initialQuery,
}: GoogleLoginButtonProps) {
  if (!googleAuthEnabled) return null;

  return (
    <a
      href={googleAuthStartUrl}
      onClick={() => {
        if (role) rememberGoogleRole(role);
        rememberGoogleReturnTo(returnTo, initialQuery);
      }}
      className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
    >
      Tiếp tục với Google
    </a>
  );
}
