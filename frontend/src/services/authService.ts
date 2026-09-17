import { apiClient } from './apiClient';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Carrera,
  AuthMessageResponse,
  VerifyResetTokenResponse,
} from '../types/auth';

const TOKEN_KEY = 'miestudio-token';
const REFRESH_KEY = 'miestudio-refresh-token';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (res.access_token) {
      localStorage.setItem(TOKEN_KEY, res.access_token);
      if (res.refresh_token) {
        localStorage.setItem(REFRESH_KEY, res.refresh_token);
      }
    }
    return res;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    if (res.access_token) {
      localStorage.setItem(TOKEN_KEY, res.access_token);
      if (res.refresh_token) {
        localStorage.setItem(REFRESH_KEY, res.refresh_token);
      }
    }
    return res;
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem(REFRESH_KEY) || '';
    const res = await apiClient.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
    if (res.access_token) {
      localStorage.setItem(TOKEN_KEY, res.access_token);
      if (res.refresh_token) {
        localStorage.setItem(REFRESH_KEY, res.refresh_token);
      }
    }
    return res;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_KEY) || '';
    try {
      await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    } catch {
      // Ignorar fallo de red en logout
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  },

  async getMe(): Promise<{ user: User; carrera_activa?: Carrera }> {
    return apiClient.get<{ user: User; carrera_activa?: Carrera }>('/auth/me');
  },

  async updateMe(data: { nombre?: string; email?: string; avatar_url?: string; password?: string; gemini_api_key?: string }): Promise<User> {
    const res = await apiClient.put<{ user: User }>('/auth/me', data);
    return res.user;
  },

  async forgotPassword(email: string): Promise<AuthMessageResponse> {
    return apiClient.post<AuthMessageResponse>('/auth/forgot-password', { email });
  },

  async verifyResetToken(token: string): Promise<VerifyResetTokenResponse> {
    return apiClient.get<VerifyResetTokenResponse>(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
  },

  async resetPassword(token: string, password: string): Promise<AuthMessageResponse> {
    return apiClient.post<AuthMessageResponse>('/auth/reset-password', { token, password });
  },

  async verifyEmail(token: string): Promise<AuthMessageResponse> {
    return apiClient.post<AuthMessageResponse>('/auth/verify-email', { token });
  },

  async resendVerification(email: string): Promise<AuthMessageResponse> {
    return apiClient.post<AuthMessageResponse>('/auth/resend-verification', { email });
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

