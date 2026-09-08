import { useState, useEffect, useCallback } from 'react';
import type { InstanciaEvaluacion } from '../types/academic';
import { evaluacionesService } from '../services';

export const useEvaluaciones = (materiaId?: string) => {
  const [evaluaciones, setEvaluaciones] = useState<InstanciaEvaluacion[]>([]);
  const [proximas, setProximas] = useState<InstanciaEvaluacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [allOrByMateria, upcoming] = await Promise.all([
        evaluacionesService.getEvaluaciones(materiaId),
        evaluacionesService.getProximasEvaluaciones()
      ]);
      setEvaluaciones(allOrByMateria);
      setProximas(upcoming);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar evaluaciones');
    } finally {
      setIsLoading(false);
    }
  }, [materiaId]);

  useEffect(() => {
    fetchEvaluaciones();
  }, [fetchEvaluaciones]);

  // Reactive listener for updates triggered from EvaluationModal or other views
  useEffect(() => {
    const handleUpdate = () => {
      fetchEvaluaciones();
    };
    window.addEventListener('evaluaciones:updated', handleUpdate);
    return () => window.removeEventListener('evaluaciones:updated', handleUpdate);
  }, [fetchEvaluaciones]);

  const createEvaluacion = async (evalData: Partial<InstanciaEvaluacion>) => {
    const created = await evaluacionesService.createEvaluacion(evalData);
    setEvaluaciones(prev => [created, ...prev]);
    setProximas(prev => [created, ...prev]);
    window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: created }));
    return created;
  };

  const updateEvaluacion = async (id: string, evalData: Partial<InstanciaEvaluacion>) => {
    const updated = await evaluacionesService.updateEvaluacion(id, evalData);
    setEvaluaciones(prev => prev.map(e => (e.id === id ? updated : e)));
    if (updated.nota !== null && updated.nota !== undefined) {
      setProximas(prev => prev.filter(e => e.id !== id));
    } else {
      setProximas(prev => prev.map(e => (e.id === id ? updated : e)));
    }
    window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: updated }));
    return updated;
  };

  const updateNota = async (id: string, nota: number) => {
    const updated = await evaluacionesService.updateNota(id, nota);
    setEvaluaciones(prev => prev.map(e => (e.id === id ? updated : e)));
    setProximas(prev => prev.filter(e => e.id !== id));
    window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: updated }));
    return updated;
  };

  const deleteEvaluacion = async (id: string) => {
    await evaluacionesService.deleteEvaluacion(id);
    setEvaluaciones(prev => prev.filter(e => e.id !== id));
    setProximas(prev => prev.filter(e => e.id !== id));
    window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: { id } }));
  };

  return {
    evaluaciones,
    proximas,
    isLoading,
    error,
    refresh: fetchEvaluaciones,
    createEvaluacion,
    updateEvaluacion,
    updateNota,
    deleteEvaluacion
  };
};
