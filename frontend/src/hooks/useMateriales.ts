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

  // Reactive listener for updates triggered from UploadMaterialModal or other views
  useEffect(() => {
    const handleUpdate = () => {
      fetchMateriales();
    };
    window.addEventListener('materiales:updated', handleUpdate);
    return () => window.removeEventListener('materiales:updated', handleUpdate);
  }, [fetchMateriales]);

  const uploadMaterial = async (
    file: File,
    titulo: string,
    categoria: MaterialEstudio['categoria'],
    targetMateriaId?: string,
    unidad?: string
  ) => {
    const idToUse = targetMateriaId || materiaId;
    if (!idToUse) throw new Error('No hay materia seleccionada');
    const created = await materialesService.uploadMaterial(idToUse, file, titulo, categoria, unidad);
    setMateriales(prev => [created, ...prev]);
    window.dispatchEvent(new CustomEvent('materiales:updated', { detail: created }));
    return created;
  };

  const uploadBatchMaterials = async (
    items: Array<{
      file: File;
      titulo: string;
      categoria: MaterialEstudio['categoria'];
      unidad?: string;
    }>,
    targetMateriaId?: string
  ) => {
    const idToUse = targetMateriaId || materiaId;
    if (!idToUse) throw new Error('No hay materia seleccionada');
    const createdList: MaterialEstudio[] = [];
    for (const item of items) {
      const created = await materialesService.uploadMaterial(
        idToUse,
        item.file,
        item.titulo,
        item.categoria,
        item.unidad
      );
      createdList.push(created);
    }
    setMateriales(prev => [...createdList, ...prev]);
    window.dispatchEvent(new CustomEvent('materiales:updated'));
    return createdList;
  };

  const deleteMaterial = async (id: string) => {
    await materialesService.deleteMaterial(id);
    setMateriales(prev => prev.filter(m => m.id !== id));
    window.dispatchEvent(new CustomEvent('materiales:updated'));
  };

  return {
    materiales,
    isLoading,
    error,
    refresh: fetchMateriales,
    uploadMaterial,
    uploadBatchMaterials,
    deleteMaterial
  };
};

export default useMateriales;
