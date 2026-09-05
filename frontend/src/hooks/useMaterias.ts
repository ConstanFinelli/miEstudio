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
      if (data.length > 0 && !selectedMateria) {
        setSelectedMateria(data[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar materias');
    } finally {
      setIsLoading(false);
    }
  }, [initialYear, initialStatus, selectedMateria]);

  useEffect(() => {
    fetchMaterias();
  }, [fetchMaterias]);

  const createMateria = async (newMateria: Partial<Materia>) => {
    const created = await materiasService.createMateria(newMateria);
    setMaterias(prev => [...prev, created]);
    setSelectedMateria(created);
    return created;
  };

  const updateMateria = async (id: string, updates: Partial<Materia>) => {
    const updated = await materiasService.updateMateria(id, updates);
    setMaterias(prev => prev.map(m => (m.id === id ? updated : m)));
    if (selectedMateria?.id === id) {
      setSelectedMateria(updated);
    }
    return updated;
  };

  const deleteMateria = async (id: string) => {
    await materiasService.deleteMateria(id);
    setMaterias(prev => prev.filter(m => m.id !== id));
    if (selectedMateria?.id === id) {
      setSelectedMateria(materias[0] || null);
    }
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
