import { apiClient } from './apiClient';
import type { MaterialDTO } from './types';
import type { MaterialEstudio } from '../types/academic';
import { materialMapper } from './mappers';
import { mockMateriales } from '../data/mockData';

let localMateriales: MaterialEstudio[] = [...mockMateriales];

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
    categoria: MaterialEstudio['categoria']
  ): Promise<MaterialEstudio> {
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('titulo', titulo);
      formData.append('categoria', categoria);

      const createdDTO = await apiClient.post<MaterialDTO>(
        `/materias/${materiaId}/materiales`,
        formData
      );
      const created = materialMapper.toMaterial(createdDTO);
      localMateriales.unshift(created);
      return created;
    } catch {
      const newMaterial: MaterialEstudio = {
        id: `mat-file-${Date.now()}`,
        materiaId,
        titulo,
        categoria,
        archivoNombre: file.name,
        archivoUrl: URL.createObjectURL(file),
        tamanioBytes: file.size,
        cantPaginas: 12,
        fechaSubida: new Date().toISOString()
      };
      localMateriales.unshift(newMaterial);
      return newMaterial;
    }
  },

  async deleteMaterial(id: string): Promise<void> {
    try {
      await apiClient.delete(`/materiales/${id}`);
    } catch {
      // noop
    }
    localMateriales = localMateriales.filter(m => m.id !== id);
  }
};
