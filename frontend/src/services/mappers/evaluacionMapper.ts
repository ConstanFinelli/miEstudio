import type { EvaluacionDTO } from '../types';
import type { InstanciaEvaluacion } from '../../types/academic';

export const evaluacionMapper = {
  toEvaluacion(
    dto: EvaluacionDTO,
    materiaNombre?: string,
    materiaCodigo?: string
  ): InstanciaEvaluacion {
    let temarioList: string[] = [];
    if (Array.isArray(dto.temario)) {
      temarioList = dto.temario;
    } else if (typeof (dto as any).temario === 'string' && (dto as any).temario.trim()) {
      try {
        const parsed = JSON.parse((dto as any).temario);
        if (Array.isArray(parsed)) {
          temarioList = parsed;
        } else if (parsed) {
          temarioList = [String(parsed)];
        }
      } catch {
        temarioList = [(dto as any).temario];
      }
    }

    return {
      id: dto.id,
      materiaId: dto.materia_id,
      materiaCodigo: dto.materia_codigo || materiaCodigo || 'MAT',
      materiaNombre: dto.materia_nombre || materiaNombre || 'Materia',
      titulo: dto.titulo,
      tipo: dto.tipo,
      fecha: dto.fecha ?? null,
      horario: dto.horario || '09:00',
      peso: dto.peso ?? 100,
      nota: dto.nota,
      estado: dto.nota !== null && dto.nota !== undefined ? 'CALIFICADO' : 'PENDIENTE',
      aula: dto.aula || 'A confirmar',
      modalidad: dto.modalidad || 'Presencial',
      temario: temarioList,
      esAprobatorio: dto.es_aprobatorio ?? true
    };
  },

  toDTO(evaluacion: Partial<InstanciaEvaluacion>): Partial<EvaluacionDTO> {
    return {
      id: evaluacion.id,
      materia_id: evaluacion.materiaId,
      titulo: evaluacion.titulo,
      tipo: evaluacion.tipo,
      fecha: evaluacion.fecha !== undefined ? evaluacion.fecha : null,
      horario: evaluacion.horario,
      nota: evaluacion.nota,
      peso: evaluacion.peso,
      es_aprobatorio: evaluacion.esAprobatorio,
      aula: evaluacion.aula,
      modalidad: evaluacion.modalidad,
      temario: evaluacion.temario
    };
  }
};
