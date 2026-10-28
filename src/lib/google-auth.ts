const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
const RETURN_TO_KEY = 'sam:google:return-to';
const ROLE_KEY = 'sam:google:role';
const LINK_KEY = 'sam:google:link-pending';

export const googleAuthEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true';
export const googleAuthStartUrl = `${API_BASE}/api/v1/auth/google/start`;

export function rememberGoogleReturnTo(returnTo?: string, initialQuery?: string) {
  sessionStorage.removeItem(RETURN_TO_KEY);
  if (returnTo?.startsWith('/') && !returnTo.startsWith('//') && !returnTo.includes('\\')) {
    sessionStorage.setItem(RETURN_TO_KEY, JSON.stringify({ returnTo, initialQuery }));
  }
}

export function takeGoogleReturnTo(): { returnTo: string; initialQuery?: string } | null {
  const raw = sessionStorage.getItem(RETURN_TO_KEY);
  sessionStorage.removeItem(RETURN_TO_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as { returnTo?: string; initialQuery?: string };
    return value.returnTo?.startsWith('/') && !value.returnTo.startsWith('//')
      ? { returnTo: value.returnTo, initialQuery: value.initialQuery }
      : null;
  } catch {
    return null;
  }
}

export function rememberGoogleRole(role: 'CLIENT' | 'FREELANCER') {
  sessionStorage.setItem(ROLE_KEY, role);
}

export function getGoogleRole(): 'CLIENT' | 'FREELANCER' {
  const role = sessionStorage.getItem(ROLE_KEY);
  return role === 'FREELANCER' ? 'FREELANCER' : 'CLIENT';
}

export function clearGoogleRole() {
  sessionStorage.removeItem(ROLE_KEY);
}

export function setGoogleLinkPending() {
  sessionStorage.setItem(LINK_KEY, '1');
}

export function hasGoogleLinkPending() {
  return sessionStorage.getItem(LINK_KEY) === '1';
}

export function clearGoogleLinkPending() {
  sessionStorage.removeItem(LINK_KEY);
}
