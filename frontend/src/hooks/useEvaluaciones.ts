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

  const createEvaluacion = async (evalData: Partial<InstanciaEvaluacion>) => {
    const created = await evaluacionesService.createEvaluacion(evalData);
    setEvaluaciones(prev => [created, ...prev]);
    setProximas(prev => [created, ...prev]);
    return created;
  };

  const updateNota = async (id: string, nota: number) => {
    const updated = await evaluacionesService.updateNota(id, nota);
    setEvaluaciones(prev => prev.map(e => (e.id === id ? updated : e)));
    setProximas(prev => prev.map(e => (e.id === id ? updated : e)));
    return updated;
  };

  return {
    evaluaciones,
    proximas,
    isLoading,
    error,
    refresh: fetchEvaluaciones,
    createEvaluacion,
    updateNota
  };
};
