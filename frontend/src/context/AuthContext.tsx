import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Carrera, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';
import { carrerasService } from '../services/carrerasService';

interface AuthContextType {
  user: User | null;
  activeCarrera: Carrera | null;
  carreras: Carrera[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  selectCarrera: (carreraId: string) => Promise<void>;
  reloadProfile: () => Promise<void>;
  reloadCarreras: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeCarrera, setActiveCarrera] = useState<Carrera | null>(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const reloadCarreras = useCallback(async () => {
    try {
      const list = await carrerasService.getCarreras();
      setCarreras(list);
      const active = list.find((c) => c.is_activa) || list[0] || null;
      setActiveCarrera(active);
    } catch {
      // Si falla o no está logueado, mantener estado
    }
  }, []);

  const reloadProfile = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setActiveCarrera(null);
      setIsLoading(false);
      return;
    }

    try {
      const { user: me, carrera_activa } = await authService.getMe();
      setUser(me);
      if (carrera_activa) {
        setActiveCarrera(carrera_activa);
      }
      await reloadCarreras();
    } catch (err) {
      console.warn('[AuthContext] Error cargando perfil autenticado:', err);
      // Intentar refrescar token antes de desloguear
      try {
        const refreshResp = await authService.refreshToken();
        setUser(refreshResp.user);
        if (refreshResp.carrera_activa) {
          setActiveCarrera(refreshResp.carrera_activa);
        }
        await reloadCarreras();
      } catch {
        await authService.logout();
        setUser(null);
        setActiveCarrera(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [reloadCarreras]);

  useEffect(() => {
    reloadProfile();
  }, [reloadProfile]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const resp = await authService.login(credentials);
      setUser(resp.user);
      if (resp.carrera_activa) {
        setActiveCarrera(resp.carrera_activa);
      }
      await reloadCarreras();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const resp = await authService.register(data);
      setUser(resp.user);
      if (resp.carrera_activa) {
        setActiveCarrera(resp.carrera_activa);
      }
      await reloadCarreras();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setActiveCarrera(null);
      setCarreras([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCarrera = async (carreraId: string) => {
    await carrerasService.setActiveCarrera(carreraId);
    await reloadCarreras();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeCarrera,
        carreras,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        selectCarrera,
        reloadProfile,
        reloadCarreras,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
