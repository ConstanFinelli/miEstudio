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
  deleteCarrera: (carreraId: string) => Promise<void>;
  reloadProfile: () => Promise<void>;
  reloadCarreras: () => Promise<void>;
  updateUser: (data: { nombre?: string; email?: string; avatar_url?: string; password?: string; gemini_api_key?: string }) => Promise<User>;
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
      if (active?.id) {
        localStorage.setItem('miestudio-active-carrera', active.id);
      } else {
        localStorage.removeItem('miestudio-active-carrera');
      }
    } catch {
      // Si falla o no está logueado, mantener estado
    }
  }, []);

  const reloadProfile = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setActiveCarrera(null);
      localStorage.removeItem('miestudio-active-carrera');
      setIsLoading(false);
      return;
    }

    try {
      const { user: me, carrera_activa } = await authService.getMe();
      setUser(me);
      if (carrera_activa) {
        setActiveCarrera(carrera_activa);
        localStorage.setItem('miestudio-active-carrera', carrera_activa.id);
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
          localStorage.setItem('miestudio-active-carrera', refreshResp.carrera_activa.id);
        }
        await reloadCarreras();
      } catch {
        await authService.logout();
        setUser(null);
        setActiveCarrera(null);
        localStorage.removeItem('miestudio-active-carrera');
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
        localStorage.setItem('miestudio-active-carrera', resp.carrera_activa.id);
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
        localStorage.setItem('miestudio-active-carrera', resp.carrera_activa.id);
      }
      await reloadCarreras();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('miestudio-active-carrera');
      await authService.logout();
      setUser(null);
      setActiveCarrera(null);
      setCarreras([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCarrera = async (carreraId: string) => {
    localStorage.setItem('miestudio-active-carrera', carreraId);
    await carrerasService.setActiveCarrera(carreraId);
    await reloadCarreras();
    window.dispatchEvent(new CustomEvent('carrera:selected', { detail: carreraId }));
    window.dispatchEvent(new CustomEvent('materias:updated'));
    window.dispatchEvent(new CustomEvent('horarios:updated'));
    window.dispatchEvent(new CustomEvent('evaluaciones:updated'));
  };

  const deleteCarrera = async (carreraId: string) => {
    await carrerasService.deleteCarrera(carreraId);
    const updatedList = carreras.filter((c) => c.id !== carreraId);
    setCarreras(updatedList);

    if (activeCarrera?.id === carreraId) {
      const nextActive = updatedList.find((c) => c.is_activa) || updatedList[0] || null;
      setActiveCarrera(nextActive);
      if (nextActive) {
        localStorage.setItem('miestudio-active-carrera', nextActive.id);
        await carrerasService.setActiveCarrera(nextActive.id).catch(() => {});
        window.dispatchEvent(new CustomEvent('carrera:selected', { detail: nextActive.id }));
      } else {
        localStorage.removeItem('miestudio-active-carrera');
      }
    }

    await reloadCarreras();
    window.dispatchEvent(new CustomEvent('carreras:updated'));
    window.dispatchEvent(new CustomEvent('materias:updated'));
    window.dispatchEvent(new CustomEvent('horarios:updated'));
    window.dispatchEvent(new CustomEvent('evaluaciones:updated'));
  };

  const updateUser = async (data: { nombre?: string; email?: string; avatar_url?: string; password?: string; gemini_api_key?: string }) => {
    try {
      const updated = await authService.updateMe(data);
      setUser(updated);
      return updated;
    } catch {
      // Fallback local en desarrollo/offline
      if (user) {
        const localUpdated: User = {
          ...user,
          nombre: data.nombre ?? user.nombre,
          email: data.email ?? user.email,
          avatar_url: data.avatar_url ?? user.avatar_url,
          has_gemini_key: data.gemini_api_key !== undefined ? !!data.gemini_api_key : user.has_gemini_key,
        };
        setUser(localUpdated);
        return localUpdated;
      }
      throw new Error('No hay usuario autenticado');
    }
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
        deleteCarrera,
        reloadProfile,
        reloadCarreras,
        updateUser,
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
