import { apiClient } from './apiClient';
import type { PerfilDTO } from './types';
import type { PerfilEstudiante } from '../types/academic';
import { perfilMapper } from './mappers';
import { mockPerfil } from '../data/mockData';

let localPerfil: PerfilEstudiante = { ...mockPerfil };

export const perfilService = {
  async getPerfil(): Promise<PerfilEstudiante> {
    try {
      const dto = await apiClient.get<PerfilDTO>('/perfil');
      return perfilMapper.toPerfil(dto);
    } catch {
      return { ...localPerfil };
    }
  },

  async updatePerfil(updates: Partial<PerfilEstudiante>): Promise<PerfilEstudiante> {
    try {
      const updatedDTO = await apiClient.put<PerfilDTO>('/perfil', updates);
      const updated = perfilMapper.toPerfil(updatedDTO);
      localPerfil = { ...localPerfil, ...updated };
      return updated;
    } catch {
      localPerfil = { ...localPerfil, ...updates };
      return { ...localPerfil };
    }
  }
};
