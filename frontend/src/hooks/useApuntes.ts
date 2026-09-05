import { useState, useEffect, useCallback } from 'react';
import type { ApunteNota } from '../types/academic';
import { apuntesService } from '../services';

export const useApuntes = (materiaId?: string) => {
  const [apuntes, setApuntes] = useState<ApunteNota[]>([]);
  const [selectedApunte, setSelectedApunte] = useState<ApunteNota | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApuntes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apuntesService.getApuntes(materiaId);
      setApuntes(data);
      if (data.length > 0 && !selectedApunte) {
        setSelectedApunte(data[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar apuntes');
    } finally {
      setIsLoading(false);
    }
  }, [materiaId, selectedApunte]);

  useEffect(() => {
    fetchApuntes();
  }, [fetchApuntes]);

  const createApunte = async (newNote: Partial<ApunteNota>) => {
    const created = await apuntesService.createApunte(newNote);
    setApuntes(prev => [created, ...prev]);
    setSelectedApunte(created);
    return created;
  };

  const updateApunte = async (id: string, updates: Partial<ApunteNota>) => {
    const updated = await apuntesService.updateApunte(id, updates);
    setApuntes(prev => prev.map(a => (a.id === id ? updated : a)));
    if (selectedApunte?.id === id) {
      setSelectedApunte(updated);
    }
    return updated;
  };

  const deleteApunte = async (id: string) => {
    await apuntesService.deleteApunte(id);
    setApuntes(prev => prev.filter(a => a.id !== id));
    if (selectedApunte?.id === id) {
      setSelectedApunte(apuntes[0] || null);
    }
  };

  return {
    apuntes,
    selectedApunte,
    setSelectedApunte,
    isLoading,
    error,
    refresh: fetchApuntes,
    createApunte,
    updateApunte,
    deleteApunte
  };
};
