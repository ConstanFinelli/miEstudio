import { apiClient } from './apiClient';
import type { Carrera, AprobacionHistorica } from '../types/auth';

export const carrerasService = {
  async getCarreras(): Promise<Carrera[]> {
    return apiClient.get<Carrera[]>('/carreras');
  },

  async getActiveCarrera(): Promise<Carrera> {
    return apiClient.get<Carrera>('/carreras/activa');
  },

  async createCarrera(dto: {
    nombre: string;
    facultad_sede: string;
    legajo: string;
    semestre_actual?: string;
    ciclo_activo?: string;
    duracion_anios?: number;
    total_materias_plan?: number;
    fecha_ingreso?: string;
  }): Promise<Carrera> {
    return apiClient.post<Carrera>('/carreras', dto);
  },

  async updateCarrera(id: string, dto: Partial<Carrera>): Promise<Carrera> {
    return apiClient.patch<Carrera>(`/carreras/${id}`, dto);
  },

  async setActiveCarrera(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/carreras/${id}/activar`);
  },

  async deleteCarrera(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/carreras/${id}`);
  },

  async registrarAprobacion(dto: {
    carrera_id: string;
    materia_id: string;
    nota_final: number;
    fecha_aprobacion: string;
    tipo_aprobacion?: string;
    libro_acta?: string;
    folio_acta?: string;
    observaciones?: string;
  }): Promise<AprobacionHistorica> {
    return apiClient.post<AprobacionHistorica>('/carreras/aprobaciones/crear', dto);
  },

  async getAprobaciones(carreraId: string): Promise<AprobacionHistorica[]> {
    return apiClient.get<AprobacionHistorica[]>(`/carreras/${carreraId}/aprobaciones`);
  },

  async deleteAprobacion(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/carreras/aprobaciones/${id}`);
  }
};
