import { apiClient } from './apiClient';
import type { HorarioCursadaDTO } from './types';
import type { HorarioCursada } from '../types/academic';
import { horarioMapper } from './mappers';

let localHorarios: HorarioCursada[] = [];

export const horariosService = {
  async getHorarios(materiaId?: string, diaSemana?: string): Promise<HorarioCursada[]> {
    try {
      const params = new URLSearchParams();
      if (materiaId) params.append('materia_id', materiaId);
      if (diaSemana) params.append('dia_semana', diaSemana);
      const query = params.toString() ? `?${params.toString()}` : '';

      const dtos = await apiClient.get<HorarioCursadaDTO[]>(`/horarios${query}`);
      const list = dtos.map(dto => horarioMapper.toHorario(dto));
      localHorarios = list;
      return list;
    } catch {
      let filtered = [...localHorarios];
      if (materiaId) filtered = filtered.filter(h => h.materiaId === materiaId);
      if (diaSemana) filtered = filtered.filter(h => h.diaSemana === diaSemana);
      return filtered;
    }
  },

  async getHorarioById(id: string): Promise<HorarioCursada> {
    try {
      const dto = await apiClient.get<HorarioCursadaDTO>(`/horarios/${id}`);
      return horarioMapper.toHorario(dto);
    } catch {
      const found = localHorarios.find(h => h.id === id);
      if (!found) throw new Error(`Horario ${id} no encontrado`);
      return found;
    }
  },

  async createHorario(horario: Partial<HorarioCursada>): Promise<HorarioCursada> {
    try {
      const dtoBody = horarioMapper.toDTO(horario);
      const createdDTO = await apiClient.post<HorarioCursadaDTO>('/horarios', dtoBody);
      const created = horarioMapper.toHorario(
        createdDTO,
        horario.materiaNombre,
        horario.materiaCodigo,
        horario.materiaColor
      );
      localHorarios.push(created);
      return created;
    } catch {
      const fallback: HorarioCursada = {
        id: `horario-${Date.now()}`,
        materiaId: horario.materiaId || '',
        materiaNombre: horario.materiaNombre || 'Materia',
        materiaCodigo: horario.materiaCodigo || 'MAT',
        materiaColor: horario.materiaColor || 'var(--primary)',
        diaSemana: horario.diaSemana || 'LUNES',
        horaInicio: horario.horaInicio || '08:00',
        horaFin: horario.horaFin || '12:00',
        facultadSede: horario.facultadSede || '',
        aula: horario.aula || '',
        tipoClase: horario.tipoClase || 'Teoría',
        modalidad: horario.modalidad || 'Presencial',
        observaciones: horario.observaciones || ''
      };
      localHorarios.push(fallback);
      return fallback;
    }
  },

  async updateHorario(id: string, horario: Partial<HorarioCursada>): Promise<HorarioCursada> {
    try {
      const dtoBody = horarioMapper.toDTO(horario);
      const updatedDTO = await apiClient.put<HorarioCursadaDTO>(`/horarios/${id}`, dtoBody);
      const updated = horarioMapper.toHorario(
        updatedDTO,
        horario.materiaNombre,
        horario.materiaCodigo,
        horario.materiaColor
      );
      localHorarios = localHorarios.map(h => (h.id === id ? updated : h));
      return updated;
    } catch {
      localHorarios = localHorarios.map(h =>
        h.id === id ? { ...h, ...horario, id } as HorarioCursada : h
      );
      const found = localHorarios.find(h => h.id === id);
      if (!found) throw new Error(`Horario ${id} no encontrado`);
      return found;
    }
  },

  async deleteHorario(id: string): Promise<void> {
    try {
      await apiClient.delete(`/horarios/${id}`);
    } catch {
      // noop
    }
    localHorarios = localHorarios.filter(h => h.id !== id);
  }
};
