import type { EvaluacionDTO } from '../types';
import type { InstanciaEvaluacion } from '../../types/academic';

export const evaluacionMapper = {
  toEvaluacion(
    dto: EvaluacionDTO,
    materiaNombre: string = 'Materia',
    materiaCodigo: string = 'MAT'
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
      materiaCodigo,
      materiaNombre,
      titulo: dto.titulo,
      tipo: dto.tipo,
      fecha: dto.fecha,
      horario: dto.horario || '08:30 - 11:30 hs',
      peso: dto.peso,
      nota: dto.nota,
      estado: dto.nota !== null ? 'CALIFICADO' : 'PENDIENTE',
      aula: dto.aula || 'Aula Magna',
      modalidad: dto.modalidad || 'Presencial',
      temario: temarioList,
      asistencia: 100,
      guiasCompletadas: '3/3 Guías',
      esAprobatorio: dto.es_aprobatorio
    };
  },

  toDTO(evaluacion: Partial<InstanciaEvaluacion>): Partial<EvaluacionDTO> {
    return {
      id: evaluacion.id,
      materia_id: evaluacion.materiaId,
      titulo: evaluacion.titulo,
      tipo: evaluacion.tipo,
      fecha: evaluacion.fecha,
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
