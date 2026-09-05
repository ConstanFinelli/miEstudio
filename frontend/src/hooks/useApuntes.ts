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
      setSelectedApunte(prev => {
        if (!prev && data.length > 0) return data[0];
        if (prev && !data.some(d => d.id === prev.id)) return data[0] || null;
        return prev;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar apuntes');
    } finally {
      setIsLoading(false);
    }
  }, [materiaId]);

  useEffect(() => {
    fetchApuntes();
  }, [fetchApuntes]);

  // Reactive listener for updates triggered from NoteModal or other views
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ApunteNota>;
      fetchApuntes();
      if (customEvent.detail) {
        setSelectedApunte(customEvent.detail);
      }
    };
    window.addEventListener('apuntes:updated', handleUpdate);
    return () => window.removeEventListener('apuntes:updated', handleUpdate);
  }, [fetchApuntes]);

  const createApunte = async (newNote: Partial<ApunteNota>) => {
    const created = await apuntesService.createApunte(newNote);
    setApuntes(prev => [created, ...prev]);
    setSelectedApunte(created);
    window.dispatchEvent(new CustomEvent('apuntes:updated', { detail: created }));
    return created;
  };

  const updateApunte = async (id: string, updates: Partial<ApunteNota>) => {
    const updated = await apuntesService.updateApunte(id, updates);
    setApuntes(prev => prev.map(a => (a.id === id ? { ...a, ...updated } : a)));
    setSelectedApunte(curr => (curr?.id === id ? { ...curr, ...updated } : curr));
    return updated;
  };

  const deleteApunte = async (id: string) => {
    await apuntesService.deleteApunte(id);
    setApuntes(prev => {
      const remaining = prev.filter(a => a.id !== id);
      setSelectedApunte(curr => (curr?.id === id ? remaining[0] || null : curr));
      return remaining;
    });
    window.dispatchEvent(new CustomEvent('apuntes:updated'));
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

export default useApuntes;
