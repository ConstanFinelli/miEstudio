import type { MateriaDTO } from '../types';
import type { Materia } from '../../types/academic';

export const materiaMapper = {
  toMateria(dto: MateriaDTO, extra?: Partial<Materia>): Materia {
    // Mapear cuatrimestre Go enum a formato UI
    const cuatrimestreMap: Record<string, '1C' | '2C' | 'Anual'> = {
      PRIMERO: '1C',
      SEGUNDO: '2C',
      ANUAL: 'Anual'
    };

    return {
      id: dto.id,
      codigo: dto.codigo || `MAT-${dto.id.slice(0, 4).toUpperCase()}`,
      nombre: dto.nombre,
      anio: dto.anio,
      cuatrimestre: cuatrimestreMap[dto.cuatrimestre] || '1C',
      estado: dto.estado,
      color: dto.color || '#2563eb',
      creditos: dto.creditos ?? 6,
      comision: dto.comision || 'Comisión Única',
      modalidad: dto.modalidad || 'Presencial',
      promedio: dto.promedio ?? 0,
      asistencia: dto.asistencia ?? 100,
      ponderado: dto.ponderado ?? 0,
      profesores: extra?.profesores || {
        titular: 'Docente Titular',
        jtp: 'Docente Auxiliar'
      },
      reglasAcreditacion: extra?.reglasAcreditacion || {
        promocion: {
          minPromedio: 8.0,
          minParcial: 7.0,
          permiteRecuperatorio: false,
          descripcion: 'Promedio ≥ 8.0 sin recuperatorio.'
        },
        regularidad: {
          minNota: 4.0,
          minAsistencia: 75,
          descripcion: 'Todos los parciales ≥ 4.0 y 75% de asistencia mínima.'
        }
      },
      correlativas: extra?.correlativas || {
        requiere: [],
        habilita: []
      }
    };
  },

  toDTO(materia: Partial<Materia>): Partial<MateriaDTO> {
    const cuatrimestreReverseMap: Record<string, 'PRIMERO' | 'SEGUNDO' | 'ANUAL'> = {
      '1C': 'PRIMERO',
      '2C': 'SEGUNDO',
      Anual: 'ANUAL'
    };

    return {
      id: materia.id,
      codigo: materia.codigo,
      nombre: materia.nombre,
      anio: materia.anio,
      cuatrimestre: materia.cuatrimestre ? cuatrimestreReverseMap[materia.cuatrimestre] : undefined,
      estado: materia.estado,
      color: materia.color,
      creditos: materia.creditos,
      comision: materia.comision,
      modalidad: materia.modalidad,
      promedio: materia.promedio,
      asistencia: materia.asistencia,
      ponderado: materia.ponderado
    };
  }
};
