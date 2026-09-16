import { apiClient } from './apiClient';
import type { EvaluacionDTO } from './types';
import type { InstanciaEvaluacion, EstadoEvaluacion, Materia } from '../types/academic';
import { evaluacionMapper } from './mappers';
import { mockEvaluaciones } from '../data/mockData';
import { isMocksEnabled } from '../config/mockConfig';
import { materiasService } from './materiasService';

let localEvaluaciones: InstanciaEvaluacion[] = isMocksEnabled() ? [...mockEvaluaciones] : [];

async function getMateriasMap(): Promise<Map<string, Materia>> {
  const map = new Map<string, Materia>();
  try {
    const materias = await materiasService.getMaterias();
    for (const m of materias) {
      map.set(m.id, m);
    }
  } catch {
    // Si falla o está offline, retornar map vacío
  }
  return map;
}

export const evaluacionesService = {
  async getEvaluaciones(materiaId?: string): Promise<InstanciaEvaluacion[]> {
    try {
      const endpoint = materiaId ? `/evaluaciones?materia_id=${materiaId}` : '/evaluaciones';
      const dtos = await apiClient.get<EvaluacionDTO[]>(endpoint);
      const matMap = await getMateriasMap();

      return dtos.map(dto => {
        const mat = matMap.get(dto.materia_id);
        const ev = evaluacionMapper.toEvaluacion(
          dto,
          dto.materia_nombre || mat?.nombre,
          dto.materia_codigo || mat?.codigo
        );
        if (!ev.carreraId) {
          ev.carreraId = dto.carrera_id || mat?.carreraId;
        }
        return ev;
      });
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
      const matMap = await getMateriasMap();

      return dtos
        .filter(dto => dto.nota === null || dto.nota === undefined)
        .map(dto => {
          const mat = matMap.get(dto.materia_id);
          const ev = evaluacionMapper.toEvaluacion(
            dto,
            dto.materia_nombre || mat?.nombre,
            dto.materia_codigo || mat?.codigo
          );
          if (!ev.carreraId) {
            ev.carreraId = dto.carrera_id || mat?.carreraId;
          }
          return ev;
        });
    } catch {
      return localEvaluaciones.filter(
        e => (e.estado === 'PENDIENTE' || e.estado === 'EN_PROGRESO') && (e.nota === null || e.nota === undefined)
      );
    }
  },

  async createEvaluacion(evaluacion: Partial<InstanciaEvaluacion>): Promise<InstanciaEvaluacion> {
    try {
      const dtoBody = evaluacionMapper.toDTO(evaluacion);
      const createdDTO = await apiClient.post<EvaluacionDTO>('/evaluaciones', dtoBody);
      const created = evaluacionMapper.toEvaluacion(
        createdDTO,
        createdDTO.materia_nombre || evaluacion.materiaNombre,
        createdDTO.materia_codigo || evaluacion.materiaCodigo
      );
      if (!created.carreraId && evaluacion.carreraId) {
        created.carreraId = evaluacion.carreraId;
      }
      localEvaluaciones.unshift(created);
      window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: created }));
      return created;
    } catch {
      const estadoInicial: EstadoEvaluacion =
        evaluacion.nota !== null && evaluacion.nota !== undefined ? 'CALIFICADO' : 'PENDIENTE';
      const newEval: InstanciaEvaluacion = {
        id: `eval-${Date.now()}`,
        materiaId: evaluacion.materiaId || 'mat-1',
        carreraId: evaluacion.carreraId,
        materiaCodigo: evaluacion.materiaCodigo || 'MAT',
        materiaNombre: evaluacion.materiaNombre || 'Materia',
        titulo: evaluacion.titulo || 'Nueva Evaluación',
        tipo: evaluacion.tipo || 'PARCIAL',
        fecha: evaluacion.fecha ?? null,
        horario: evaluacion.horario || '09:00',
        peso: evaluacion.peso ?? 100,
        nota: evaluacion.nota ?? null,
        estado: evaluacion.estado || estadoInicial,
        aula: evaluacion.aula || 'A confirmar',
        modalidad: evaluacion.modalidad || 'Presencial',
        temario: evaluacion.temario || [],
        esAprobatorio: evaluacion.esAprobatorio ?? true
      };
      localEvaluaciones.unshift(newEval);
      window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: newEval }));
      return newEval;
    }
  },

  async updateEvaluacion(id: string, updates: Partial<InstanciaEvaluacion>): Promise<InstanciaEvaluacion> {
    try {
      const dtoBody = evaluacionMapper.toDTO(updates);
      const payload = {
        ...dtoBody,
        clear_nota: updates.nota === null,
        clear_fecha: updates.fecha === null || updates.fecha === ''
      };
      const updatedDTO = await apiClient.put<EvaluacionDTO>(`/evaluaciones/${id}`, payload);
      const updated = evaluacionMapper.toEvaluacion(
        updatedDTO,
        updatedDTO.materia_nombre || updates.materiaNombre,
        updatedDTO.materia_codigo || updates.materiaCodigo
      );
      if (!updated.carreraId && updates.carreraId) {
        updated.carreraId = updates.carreraId;
      }
      localEvaluaciones = localEvaluaciones.map(e => (e.id === id ? { ...e, ...updated } : e));
      window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: updated }));
      return updated;
    } catch {
      localEvaluaciones = localEvaluaciones.map(e => {
        if (e.id !== id) return e;
        const newNota = updates.nota !== undefined ? updates.nota : e.nota;
        const nuevoEstado: EstadoEvaluacion =
          newNota !== null && newNota !== undefined ? 'CALIFICADO' : 'PENDIENTE';
        return {
          ...e,
          ...updates,
          nota: newNota,
          estado: updates.estado || nuevoEstado
        };
      });
      const found = localEvaluaciones.find(e => e.id === id);
      if (!found) throw new Error(`Evaluación con ID ${id} no encontrada`);
      window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: found }));
      return found;
    }
  },

  async updateNota(id: string, nota: number): Promise<InstanciaEvaluacion> {
    try {
      const updatedDTO = await apiClient.patch<EvaluacionDTO>(`/evaluaciones/${id}/nota`, { nota });
      const updated = evaluacionMapper.toEvaluacion(updatedDTO);
      localEvaluaciones = localEvaluaciones.map(e => (e.id === id ? { ...e, ...updated } : e));
      window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: updated }));
      return updated;
    } catch {
      const estadoCalificado: EstadoEvaluacion = 'CALIFICADO';
      localEvaluaciones = localEvaluaciones.map(e =>
        e.id === id ? { ...e, nota, estado: estadoCalificado } : e
      );
      const found = localEvaluaciones.find(e => e.id === id);
      if (!found) throw new Error(`Evaluación con ID ${id} no encontrada`);
      window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: found }));
      return found;
    }
  },

  async deleteEvaluacion(id: string): Promise<void> {
    try {
      await apiClient.delete(`/evaluaciones/${id}`);
    } catch {
      // noop
    }
    localEvaluaciones = localEvaluaciones.filter(e => e.id !== id);
    window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: { id } }));
  }
};
