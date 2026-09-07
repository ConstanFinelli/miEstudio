import { apiClient } from './apiClient';
import type { AuthResponse, LoginCredentials, RegisterData, User, Carrera } from '../types/auth';

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

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
