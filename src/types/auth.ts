export type UserRole = 'FREELANCER' | 'CLIENT' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  accountType: 'FREELANCER' | 'CLIENT';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface CurrentUser {
  userId: string;
  email: string;
  accountType: UserRole;
  sessionId: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}
