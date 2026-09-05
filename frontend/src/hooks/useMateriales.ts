import { useState, useEffect, useCallback } from 'react';
import type { MaterialEstudio } from '../types/academic';
import { materialesService } from '../services';

export const useMateriales = (materiaId?: string) => {
  const [materiales, setMateriales] = useState<MaterialEstudio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMateriales = useCallback(async () => {
    if (!materiaId) {
      setMateriales([]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await materialesService.getMateriales(materiaId);
      setMateriales(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar materiales');
    } finally {
      setIsLoading(false);
    }
  }, [materiaId]);

  useEffect(() => {
    fetchMateriales();
  }, [fetchMateriales]);

  const uploadMaterial = async (
    file: File,
    titulo: string,
    categoria: MaterialEstudio['categoria']
  ) => {
    if (!materiaId) throw new Error('No hay materia seleccionada');
    const created = await materialesService.uploadMaterial(materiaId, file, titulo, categoria);
    setMateriales(prev => [created, ...prev]);
    return created;
  };

  const deleteMaterial = async (id: string) => {
    await materialesService.deleteMaterial(id);
    setMateriales(prev => prev.filter(m => m.id !== id));
  };

  return {
    materiales,
    isLoading,
    error,
    refresh: fetchMateriales,
    uploadMaterial,
    deleteMaterial
  };
};

export default useMateriales;
