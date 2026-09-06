import type { HorarioCursadaDTO } from '../types';
import type { HorarioCursada, DiaSemana } from '../../types/academic';

export const horarioMapper = {
  toHorario(
    dto: HorarioCursadaDTO,
    materiaNombre?: string,
    materiaCodigo?: string,
    materiaColor?: string
  ): HorarioCursada {
    return {
      id: dto.id,
      materiaId: dto.materia_id,
      materiaNombre: dto.materia?.nombre || materiaNombre || 'Materia',
      materiaCodigo: dto.materia?.codigo || materiaCodigo || 'MAT',
      materiaColor: dto.materia?.color || materiaColor || 'var(--primary)',
      diaSemana: dto.dia_semana as DiaSemana,
      horaInicio: dto.hora_inicio,
      horaFin: dto.hora_fin,
      facultadSede: dto.facultad_sede || '',
      aula: dto.aula || '',
      tipoClase: dto.tipo_clase || 'Teoría',
      modalidad: dto.modalidad || 'Presencial',
      observaciones: dto.observaciones || ''
    };
  },

  toDTO(horario: Partial<HorarioCursada>): Partial<HorarioCursadaDTO> {
    return {
      id: horario.id,
      materia_id: horario.materiaId,
      dia_semana: horario.diaSemana,
      hora_inicio: horario.horaInicio,
      hora_fin: horario.horaFin,
      facultad_sede: horario.facultadSede,
      aula: horario.aula,
      tipo_clase: horario.tipoClase,
      modalidad: horario.modalidad,
      observaciones: horario.observaciones
    };
  }
};
