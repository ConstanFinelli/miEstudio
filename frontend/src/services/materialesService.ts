import { apiClient } from './apiClient';
import type { MaterialDTO } from './types';
import type { MaterialEstudio } from '../types/academic';
import { materialMapper } from './mappers';
import { mockMateriales } from '../data/mockData';
import { isMocksEnabled } from '../config/mockConfig';

let localMateriales: MaterialEstudio[] = isMocksEnabled() ? [...mockMateriales] : [];

export const materialesService = {
  async getMateriales(materiaId?: string): Promise<MaterialEstudio[]> {
    try {
      const endpoint = materiaId ? `/materias/${materiaId}/materiales` : '/materiales';
      const dtos = await apiClient.get<MaterialDTO[]>(endpoint);
      return dtos.map(dto => materialMapper.toMaterial(dto));
    } catch {
      if (materiaId) {
        return localMateriales.filter(m => m.materiaId === materiaId);
      }
      return [...localMateriales];
    }
  },

  async uploadMaterial(
    materiaId: string,
    file: File,
    titulo: string,
    categoria: MaterialEstudio['categoria'],
    unidad?: string
  ): Promise<MaterialEstudio> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('archivo', file);
      formData.append('titulo', titulo);
      formData.append('categoria', categoria);
      if (unidad) {
        formData.append('unidad', unidad);
      }

      const createdDTO = await apiClient.post<MaterialDTO>(
        `/materias/${materiaId}/materiales`,
        formData
      );
      const created = materialMapper.toMaterial(createdDTO);
      localMateriales.unshift(created);
      return created;
    } catch (err) {
      if (isMocksEnabled()) {
        const newMaterial: MaterialEstudio = {
          id: `mat-file-${Date.now()}`,
          materiaId,
          titulo,
          categoria,
          unidad: unidad || '',
          archivoNombre: file.name,
          archivoUrl: URL.createObjectURL(file),
          tamanioBytes: file.size,
          cantPaginas: 12,
          fechaSubida: new Date().toISOString()
        };
        localMateriales.unshift(newMaterial);
        return newMaterial;
      }
      throw err;
    }
  },

  async updateMaterial(
    id: string,
    updates: { titulo?: string; categoria?: MaterialEstudio['categoria']; unidad?: string }
  ): Promise<MaterialEstudio> {
    try {
      const updatedDTO = await apiClient.put<MaterialDTO>(`/materiales/${id}`, updates);
      const updated = materialMapper.toMaterial(updatedDTO);
      localMateriales = localMateriales.map(m => (m.id === id ? { ...m, ...updated } : m));
      window.dispatchEvent(new CustomEvent('materiales:updated', { detail: updated }));
      return updated;
    } catch (err) {
      if (isMocksEnabled()) {
        localMateriales = localMateriales.map(m => {
          if (m.id !== id) return m;
          return {
            ...m,
            titulo: updates.titulo ?? m.titulo,
            categoria: updates.categoria ?? m.categoria,
            unidad: updates.unidad !== undefined ? updates.unidad : m.unidad
          };
        });
        const found = localMateriales.find(m => m.id === id);
        if (!found) throw new Error(`Material ${id} no encontrado`);
        window.dispatchEvent(new CustomEvent('materiales:updated', { detail: found }));
        return found;
      }
      throw err;
    }
  },

  async deleteMaterial(id: string): Promise<void> {
    try {
      await apiClient.delete(`/materiales/${id}`);
    } catch {
      // noop
    }
    localMateriales = localMateriales.filter(m => m.id !== id);
  },

  async deleteMaterialesByMateria(materiaId: string): Promise<number> {
    try {
      const res = await apiClient.delete<{ deleted: number }>(`/materias/${materiaId}/materiales`);
      localMateriales = localMateriales.filter(m => m.materiaId !== materiaId);
      return res.deleted || 0;
    } catch (err) {
      console.warn('[materialesService] Error eliminando materiales por materia:', err);
      const prevCount = localMateriales.filter(m => m.materiaId === materiaId).length;
      localMateriales = localMateriales.filter(m => m.materiaId !== materiaId);
      return prevCount;
    }
  }
};
