import googleLogo from '../assets/google-g.png';
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
      className="grid min-h-11 w-full grid-cols-[20px_1fr_20px] items-center gap-2.5 rounded-md border border-[#747775] bg-white px-3 py-2.5 text-center text-sm font-medium text-[#1f1f1f] transition-colors hover:bg-[#f8faff] active:bg-[#eef2f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2 cursor-pointer"
      style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif' }}
    >
      <img src={googleLogo} alt="" className="h-5 w-5 object-contain" />
      <span>Tiếp tục với Google</span>
      <span aria-hidden="true" />
    </a>
  );
}
