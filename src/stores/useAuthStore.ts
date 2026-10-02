import { create } from 'zustand';
import { authApi } from '../api/auth';
import { tokenManager } from '../lib/token-manager';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: AuthUser | null) => void;
  login: (data: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: Boolean(user),
    });
  },

  login: async (data: LoginRequest) => {
    const auth = await authApi.login(data);
    const user: AuthUser = {
      userId: auth.userId,
      email: auth.email,
      fullName: auth.fullName,
      role: auth.role,
    };
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    return auth;
  },

  register: async (data: RegisterRequest) => {
    const auth = await authApi.register(data);
    const user: AuthUser = {
      userId: auth.userId,
      email: auth.email,
      fullName: auth.fullName,
      role: auth.role,
    };
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    return auth;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      tokenManager.clearToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  initAuth: async () => {
    try {
      set({ isLoading: true });
      const auth = await authApi.refresh();
      const user: AuthUser = {
        userId: auth.userId,
        email: auth.email,
        fullName: auth.fullName,
        role: auth.role,
      };
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      tokenManager.clearToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

export default useAuthStore;
