import { apiClient } from './apiClient';
import type { PerfilDTO } from './types';
import type { PerfilEstudiante } from '../types/academic';
import { perfilMapper } from './mappers';
import { mockPerfil } from '../data/mockData';
import { isMocksEnabled } from '../config/mockConfig';

const cleanPerfil: PerfilEstudiante = {
  nombre: 'Estudiante',
  legajo: '---',
  carrera: 'Carrera de Grado',
  semestreActual: 'Ciclo Lectivo',
  cicloActivo: 'Cuatrimestre en Curso',
  promedioGeneral: 0.0,
  deltaPromedio: 0.0,
  puestoCohorte: 0,
  percentil: 0,
  materiasAprobadas: 0,
  materiasTotales: 0,
  creditosAprobados: 0,
  creditosTotales: 0,
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
