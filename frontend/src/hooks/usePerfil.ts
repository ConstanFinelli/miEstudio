import { useState, useEffect, useCallback } from 'react';
import type { PerfilEstudiante } from '../types/academic';
import { perfilService } from '../services';

export const usePerfil = () => {
  const [perfil, setPerfil] = useState<PerfilEstudiante | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerfil = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await perfilService.getPerfil();
      setPerfil(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar perfil');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  const updatePerfil = async (updates: Partial<PerfilEstudiante>) => {
    const updated = await perfilService.updatePerfil(updates);
    setPerfil(updated);
    return updated;
  };

  return {
    perfil,
    isLoading,
    error,
    refresh: fetchPerfil,
    updatePerfil
  };
};
