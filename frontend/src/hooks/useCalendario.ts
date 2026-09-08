import { useState, useEffect, useCallback } from 'react';
import type { EventoCalendario } from '../types/academic';
import { calendarioService } from '../services';

export const useCalendario = () => {
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await calendarioService.getEventos();
      setEventos(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar calendario');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  // Reactive listener for updates triggered from other views/components
  useEffect(() => {
    const handleUpdate = () => {
      fetchEventos();
    };
    window.addEventListener('calendario:updated', handleUpdate);
    return () => window.removeEventListener('calendario:updated', handleUpdate);
  }, [fetchEventos]);

  const createEvento = async (evento: Partial<EventoCalendario>) => {
    const created = await calendarioService.createEvento(evento);
    setEventos(prev => [...prev, created]);
    window.dispatchEvent(new CustomEvent('calendario:updated', { detail: created }));
    return created;
  };

  return {
    eventos,
    isLoading,
    error,
    refresh: fetchEventos,
    createEvento
  };
};
