import { apiClient } from './apiClient';
import type { PerfilDTO } from './types';
import type { PerfilEstudiante } from '../types/academic';
import { perfilMapper } from './mappers';
import { mockPerfil } from '../data/mockData';
import { isMocksEnabled } from '../config/mockConfig';

const cleanPerfil: PerfilEstudiante = {
  nombre: 'Sofía Chen',
  legajo: '#48.910',
  carrera: 'Ingeniería en Sistemas',
  semestreActual: 'Ciclo 2026',
  cicloActivo: '2026 · 1er Cuatrimestre',
  promedioGeneral: 0.0,
  deltaPromedio: 0.0,
  puestoCohorte: 1,
  percentil: 100,
  materiasAprobadas: 0,
  materiasTotales: 44,
  creditosAprobados: 0,
  creditosTotales: 280,
  promedioHistorico: []
};

let localPerfil: PerfilEstudiante = isMocksEnabled() ? { ...mockPerfil } : { ...cleanPerfil };

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
