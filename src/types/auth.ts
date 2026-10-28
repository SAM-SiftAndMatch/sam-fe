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
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}
