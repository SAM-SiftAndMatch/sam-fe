export interface JwtPayload {
  sub: string;
  user_id: string;
  session_id: string;
  account_type: string;
  exp: number;
  iat: number;
  jti?: string;
  iss?: string;
}

let accessToken: string | null = null;
let sessionEpoch = 0;
const listeners = new Set<() => void>();

export const tokenManager = {
  getToken: (): string | null => accessToken,
  getSessionEpoch: (): number => sessionEpoch,
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  setToken: (token: string): void => {
    const old = accessToken ? tokenManager.decodePayload(accessToken) : null;
    const next = tokenManager.decodePayload(token);
    if (!old || !next || old.user_id !== next.user_id || old.account_type !== next.account_type)
      sessionEpoch++;
    accessToken = token;
    for (const listener of listeners) {
      try {
        listener();
      } catch {
        /* A closed socket must not break token rotation. */
      }
    }
  },
  clearToken: (): void => {
    accessToken = null;
    sessionEpoch++;
    for (const listener of listeners) {
      try {
        listener();
      } catch {
        /* Ignore disposed listeners. */
      }
    }
  },

  /** Decode JWT payload (without verification) */
  decodePayload: (token: string): JwtPayload | null => {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },

  /** Check if token is expired, with an optional buffer in seconds */
  isExpired: (token: string, bufferSeconds = 30): boolean => {
    const payload = tokenManager.decodePayload(token);
    if (!payload?.exp) return true;
    return Date.now() >= (payload.exp - bufferSeconds) * 1000;
  },
};
