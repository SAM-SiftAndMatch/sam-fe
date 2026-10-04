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

export const tokenManager = {
  getToken: (): string | null => accessToken,
  setToken: (token: string): void => {
    accessToken = token;
  },
  clearToken: (): void => {
    accessToken = null;
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
