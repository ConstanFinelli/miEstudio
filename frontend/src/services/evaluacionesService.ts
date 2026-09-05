import { apiClient } from './apiClient';
import type { EvaluacionDTO } from './types';
import type { InstanciaEvaluacion } from '../types/academic';
import { evaluacionMapper } from './mappers';
import { mockEvaluaciones } from '../data/mockData';

let localEvaluaciones: InstanciaEvaluacion[] = [...mockEvaluaciones];

export const evaluacionesService = {
  async getEvaluaciones(materiaId?: string): Promise<InstanciaEvaluacion[]> {
    try {
      const endpoint = materiaId ? `/evaluaciones?materia_id=${materiaId}` : '/evaluaciones';
      const dtos = await apiClient.get<EvaluacionDTO[]>(endpoint);
      return dtos.map(dto => evaluacionMapper.toEvaluacion(dto));
    } catch {
      if (materiaId) {
        return localEvaluaciones.filter(e => e.materiaId === materiaId);
      }
      return [...localEvaluaciones];
    }
  },

  async getProximasEvaluaciones(): Promise<InstanciaEvaluacion[]> {
    try {
      const dtos = await apiClient.get<EvaluacionDTO[]>('/evaluaciones/proximas');
      return dtos.map(dto => evaluacionMapper.toEvaluacion(dto));
    } catch {
      return localEvaluaciones.filter(e => e.estado === 'PENDIENTE' || e.estado === 'EN_PROGRESO');
    }
  },

  async createEvaluacion(evaluacion: Partial<InstanciaEvaluacion>): Promise<InstanciaEvaluacion> {
    try {
      const dtoBody = evaluacionMapper.toDTO(evaluacion);
      const createdDTO = await apiClient.post<EvaluacionDTO>('/evaluaciones', dtoBody);
      const created = evaluacionMapper.toEvaluacion(
        createdDTO,
        evaluacion.materiaNombre,
        evaluacion.materiaCodigo
      );
      localEvaluaciones.unshift(created);
      return created;
    } catch {
      const newEval: InstanciaEvaluacion = {
        id: `eval-${Date.now()}`,
        materiaId: evaluacion.materiaId || 'mat-1',
        materiaCodigo: evaluacion.materiaCodigo || 'MAT',
        materiaNombre: evaluacion.materiaNombre || 'Materia',
        titulo: evaluacion.titulo || 'Nueva Evaluación',
        tipo: evaluacion.tipo || 'PARCIAL',
        fecha: evaluacion.fecha || new Date().toISOString(),
        horario: evaluacion.horario || '09:00 hs',
        peso: evaluacion.peso || 30,
        nota: evaluacion.nota ?? null,
        estado: evaluacion.nota !== null && evaluacion.nota !== undefined ? 'CALIFICADO' : 'PENDIENTE',
        aula: evaluacion.aula || 'Aula 204',
        modalidad: evaluacion.modalidad || 'Presencial',
        temario: evaluacion.temario || ['Contenido de evaluación'],
        asistencia: 100,
        guiasCompletadas: '3/3 Guías',
        esAprobatorio: evaluacion.esAprobatorio ?? true
      };
      localEvaluaciones.unshift(newEval);
      return newEval;
    }
  },

  async updateNota(id: string, nota: number): Promise<InstanciaEvaluacion> {
    try {
      const updatedDTO = await apiClient.patch<EvaluacionDTO>(`/evaluaciones/${id}/nota`, { nota });
      const updated = evaluacionMapper.toEvaluacion(updatedDTO);
      localEvaluaciones = localEvaluaciones.map(e => (e.id === id ? { ...e, ...updated } : e));
      return updated;
    } catch {
      localEvaluaciones = localEvaluaciones.map(e =>
        e.id === id ? { ...e, nota, estado: 'CALIFICADO' } : e
      );
      const found = localEvaluaciones.find(e => e.id === id);
      if (!found) throw new Error(`Evaluación con ID ${id} no encontrada`);
      return found;
    }
  }
};
