import { useState, useEffect, useCallback } from 'react';
import type { HorarioCursada } from '../types/academic';
import { horariosService } from '../services';

export const useHorarios = (materiaId?: string, diaSemana?: string) => {
  const [horarios, setHorarios] = useState<HorarioCursada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHorarios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await horariosService.getHorarios(materiaId, diaSemana);
      setHorarios(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar horarios de cursada');
    } finally {
      setIsLoading(false);
    }
  }, [materiaId, diaSemana]);

  useEffect(() => {
    fetchHorarios();
  }, [fetchHorarios]);

  // Escuchar actualizaciones globales de horarios para refrescar de forma reactiva
  useEffect(() => {
    const handleUpdated = () => {
      fetchHorarios();
    };
    window.addEventListener('horarios:updated', handleUpdated);
    return () => {
      window.removeEventListener('horarios:updated', handleUpdated);
    };
  }, [fetchHorarios]);

  const createHorario = async (horarioData: Partial<HorarioCursada>) => {
    const created = await horariosService.createHorario(horarioData);
    setHorarios(prev => [...prev, created]);
    window.dispatchEvent(new CustomEvent('horarios:updated', { detail: created }));
    return created;
  };

  const updateHorario = async (id: string, horarioData: Partial<HorarioCursada>) => {
    const updated = await horariosService.updateHorario(id, horarioData);
    setHorarios(prev => prev.map(h => (h.id === id ? updated : h)));
    window.dispatchEvent(new CustomEvent('horarios:updated', { detail: updated }));
    return updated;
  };

  const deleteHorario = async (id: string) => {
    await horariosService.deleteHorario(id);
    setHorarios(prev => prev.filter(h => h.id !== id));
    window.dispatchEvent(new CustomEvent('horarios:updated', { detail: { id } }));
  };

  return {
    horarios,
    isLoading,
    error,
    refresh: fetchHorarios,
    createHorario,
    updateHorario,
    deleteHorario
  };
};
