import { useState, useEffect, useCallback } from 'react';
import type { Materia } from '../types/academic';
import { materiasService } from '../services';

export const useMaterias = (initialYear?: number, initialStatus?: string) => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterias = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await materiasService.getMaterias({
        anio: initialYear,
        estado: initialStatus
      });
      setMaterias(data);
      setSelectedMateria(prev => {
        if (!prev && data.length > 0) return data[0];
        if (prev && !data.some(d => d.id === prev.id)) return data[0] || null;
        if (prev) {
          const fresh = data.find(d => d.id === prev.id);
          if (fresh) return fresh;
        }
        return prev;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar materias');
    } finally {
      setIsLoading(false);
    }
  }, [initialYear, initialStatus]);

  useEffect(() => {
    fetchMaterias();
  }, [fetchMaterias]);

  // Reactive listener for updates triggered from MateriaModal or other views
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Materia | undefined>;
      fetchMaterias();
      if (customEvent.detail) {
        setSelectedMateria(customEvent.detail);
      }
    };
    window.addEventListener('materias:updated', handleUpdate);
    return () => window.removeEventListener('materias:updated', handleUpdate);
  }, [fetchMaterias]);

  // Reactive listener for updates triggered when evaluations change (updates promedio of materias)
  useEffect(() => {
    const handleEvaluacionesUpdate = () => {
      fetchMaterias();
    };
    window.addEventListener('evaluaciones:updated', handleEvaluacionesUpdate);
    return () => window.removeEventListener('evaluaciones:updated', handleEvaluacionesUpdate);
  }, [fetchMaterias]);

  const createMateria = async (newMateria: Partial<Materia>) => {
    const created = await materiasService.createMateria(newMateria);
    setMaterias(prev => [...prev, created]);
    setSelectedMateria(created);
    window.dispatchEvent(new CustomEvent('materias:updated', { detail: created }));
    return created;
  };

  const updateMateria = async (id: string, updates: Partial<Materia>) => {
    const updated = await materiasService.updateMateria(id, updates);
    setMaterias(prev => prev.map(m => (m.id === id ? updated : m)));
    setSelectedMateria(curr => (curr?.id === id ? updated : curr));
    window.dispatchEvent(new CustomEvent('materias:updated', { detail: updated }));
    return updated;
  };

  const deleteMateria = async (id: string) => {
    await materiasService.deleteMateria(id);
    setMaterias(prev => {
      const remaining = prev.filter(m => m.id !== id);
      setSelectedMateria(current => {
        if (current?.id === id) {
          return remaining.length > 0 ? remaining[0] : null;
        }
        return current;
      });
      return remaining;
    });
    window.dispatchEvent(new CustomEvent('materias:updated'));
  };

  return {
    materias,
    selectedMateria,
    setSelectedMateria,
    isLoading,
    error,
    refresh: fetchMaterias,
    createMateria,
    updateMateria,
    deleteMateria
  };
};
