import { apiClient } from './apiClient';
import type { EventoCalendarioDTO } from './types';
import type { EventoCalendario } from '../types/academic';
import { mockEventosCalendario } from '../data/mockData';
import { isMocksEnabled } from '../config/mockConfig';

let localEventos: EventoCalendario[] = isMocksEnabled() ? [...mockEventosCalendario] : [];

export const calendarioService = {
  async getEventos(): Promise<EventoCalendario[]> {
    try {
      const dtos = await apiClient.get<EventoCalendarioDTO[]>('/calendario/eventos');
      return dtos.map(dto => ({
        id: dto.id,
        titulo: dto.titulo,
        materiaId: dto.materia_id || undefined,
        tipo: dto.tipo,
        fecha: dto.fecha_inicio.split('T')[0],
        horarioInicio: dto.fecha_inicio.includes('T') ? dto.fecha_inicio.split('T')[1].slice(0, 5) : '09:00',
        horarioFin: dto.fecha_fin.includes('T') ? dto.fecha_fin.split('T')[1].slice(0, 5) : '11:00',
        aula: dto.aula,
        modalidad: dto.modalidad,
        impactoAcademico: dto.impacto_academico,
        esCritico: dto.es_critico
      }));
    } catch {
      return [...localEventos];
    }
  },

  async createEvento(evento: Partial<EventoCalendario>): Promise<EventoCalendario> {
    try {
      const dtoBody = {
        materia_id: evento.materiaId,
        titulo: evento.titulo,
        fecha_inicio: `${evento.fecha}T${evento.horarioInicio || '09:00'}:00Z`,
        fecha_fin: `${evento.fecha}T${evento.horarioFin || '11:00'}:00Z`,
        tipo: evento.tipo,
        aula: evento.aula,
        modalidad: evento.modalidad
      };
      const created = await apiClient.post<EventoCalendarioDTO>('/calendario/eventos', dtoBody);
      const newEvento: EventoCalendario = {
        id: created.id,
        titulo: created.titulo,
        materiaId: created.materia_id || undefined,
        tipo: created.tipo,
        fecha: created.fecha_inicio.split('T')[0],
        horarioInicio: evento.horarioInicio || '09:00',
        horarioFin: evento.horarioFin || '11:00'
      };
      localEventos.push(newEvento);
      return newEvento;
    } catch {
      const newEvento: EventoCalendario = {
        id: `cal-${Date.now()}`,
        titulo: evento.titulo || 'Nuevo Evento',
        materiaId: evento.materiaId,
        tipo: evento.tipo || 'ESTUDIO',
        fecha: evento.fecha || new Date().toISOString().split('T')[0],
        horarioInicio: evento.horarioInicio || '09:00',
        horarioFin: evento.horarioFin || '11:00'
      };
      localEventos.push(newEvento);
      return newEvento;
    }
  }
};
