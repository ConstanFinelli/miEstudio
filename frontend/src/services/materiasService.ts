import { apiClient } from './apiClient';
import type { MateriaDTO } from './types';
import type { Materia } from '../types/academic';
import { materiaMapper } from './mappers';
import { mockMaterias } from '../data/mockData';
import { isMocksEnabled } from '../config/mockConfig';

// Almacén en memoria mutable para desarrollo offline (depende de isMocksEnabled)
let localMaterias: Materia[] = isMocksEnabled() ? [...mockMaterias] : [];

export const materiasService = {
  async getMaterias(filters?: { anio?: number; estado?: string }): Promise<Materia[]> {
    try {
      const query = new URLSearchParams();
      if (filters?.anio) query.append('anio', String(filters.anio));
      if (filters?.estado) query.append('estado', filters.estado);

      const endpoint = `/materias${query.toString() ? `?${query.toString()}` : ''}`;
      const dtos = await apiClient.get<MateriaDTO[]>(endpoint);
      return dtos.map(dto => materiaMapper.toMateria(dto));
    } catch {
      // Fallback a datos locales
      let result = [...localMaterias];
      if (filters?.anio) {
        result = result.filter(m => m.anio === filters.anio);
      }
      if (filters?.estado && filters.estado !== 'TODAS') {
        result = result.filter(m => m.estado === filters.estado);
      }
      return result;
    }
  },

  async getMateriaById(id: string): Promise<Materia | null> {
    try {
      const dto = await apiClient.get<MateriaDTO>(`/materias/${id}`);
      return materiaMapper.toMateria(dto);
    } catch {
      const found = localMaterias.find(m => m.id === id);
      return found || null;
    }
  },

  async createMateria(materia: Partial<Materia>): Promise<Materia> {
    try {
      const dtoBody = materiaMapper.toDTO(materia);
      const createdDTO = await apiClient.post<MateriaDTO>('/materias', dtoBody);
      const created = materiaMapper.toMateria(createdDTO, materia);
      localMaterias.push(created);
      return created;
    } catch {
      // Fallback local
      const newMateria: Materia = {
        id: `mat-${Date.now()}`,
        codigo: materia.codigo || `MAT-${Math.floor(100 + Math.random() * 900)}`,
        nombre: materia.nombre || 'Nueva Materia',
        anio: materia.anio || 1,
        cuatrimestre: materia.cuatrimestre || '1C',
        estado: materia.estado || 'CURSANDO',
        color: materia.color || '#2563eb',
        comision: materia.comision || 'Comisión Única',
        modalidad: materia.modalidad || 'Presencial',
        promedio: 0,
        profesores: materia.profesores || { titular: 'A designar', jtp: 'A designar' },
        reglasAcreditacion: materia.reglasAcreditacion || {
          promocion: { permitePromocion: true, condicion: 'Promedio ≥ 8.0 y parciales ≥ 7.0', minPromedio: 8.0, minParcial: 7.0, permiteRecuperatorio: false, minAsistencia: 80, descripcion: 'Promoción directa.' },
          regularidad: { condicion: 'Evaluaciones ≥ 4.0 y 75% asistencia', minNota: 4.0, minAsistencia: 75, permiteRecuperatorio: true, descripcion: 'Regularidad.' }
        },
        correlativas: materia.correlativas || { requiere: [], habilita: [] }
      };
      localMaterias.push(newMateria);
      return newMateria;
    }
  },

  async updateMateria(id: string, updates: Partial<Materia>): Promise<Materia> {
    try {
      const dtoBody = materiaMapper.toDTO(updates);
      const updatedDTO = await apiClient.put<MateriaDTO>(`/materias/${id}`, dtoBody);
      const updated = materiaMapper.toMateria(updatedDTO, updates);
      localMaterias = localMaterias.map(m => (m.id === id ? { ...m, ...updated } : m));
      return updated;
    } catch {
      localMaterias = localMaterias.map(m => (m.id === id ? { ...m, ...updates } : m));
      const found = localMaterias.find(m => m.id === id);
      if (!found) throw new Error(`Materia con ID ${id} no encontrada`);
      return found;
    }
  },

  async deleteMateria(id: string): Promise<void> {
    try {
      await apiClient.delete(`/materias/${id}`);
    } catch {
      // noop
    }
    localMaterias = localMaterias.filter(m => m.id !== id);
  }
};
