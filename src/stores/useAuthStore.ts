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

// A full-page payment redirect starts the app again. StrictMode may mount twice,
// but both mounts must share the same refresh-token rotation.
let authInitialization: Promise<void> | null = null;

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

  initAuth: () => {
    if (authInitialization) return authInitialization;
    const epoch = tokenManager.getSessionEpoch();
    set({ isLoading: true });
    authInitialization = (async () => {
      try {
        const auth = await authApi.refresh();
        // Logout/account changes while restoring a session must win.
        if (tokenManager.getToken() !== auth.accessToken) return;
        const user: AuthUser = {
          userId: auth.userId,
          email: auth.email,
          fullName: auth.fullName,
          role: auth.role,
        };
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        if (epoch !== tokenManager.getSessionEpoch()) return;
        tokenManager.clearToken();
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    })().finally(() => {
      authInitialization = null;
    });
    return authInitialization;
  },
}));

export default useAuthStore;
