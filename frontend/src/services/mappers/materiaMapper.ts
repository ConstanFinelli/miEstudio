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

    let reglasAcreditacion: Materia['reglasAcreditacion'];

    if (dto.reglas_acreditacion) {
      reglasAcreditacion = {
        promocion: {
          permitePromocion: dto.reglas_acreditacion.promocion.permite_promocion ?? true,
          minPromedio: dto.reglas_acreditacion.promocion.min_promedio ?? 8.0,
          minParcial: dto.reglas_acreditacion.promocion.min_parcial ?? 7.0,
          permiteRecuperatorio: dto.reglas_acreditacion.promocion.permite_recuperatorio ?? false,
          minAsistencia: dto.reglas_acreditacion.promocion.min_asistencia ?? 80,
          descripcion: dto.reglas_acreditacion.promocion.descripcion ||
            (dto.reglas_acreditacion.promocion.permite_promocion === false
              ? 'Sin promoción directa. Examen final obligatorio.'
              : 'Promedio ≥ 8.0 sin recuperatorio.')
        },
        regularidad: {
          minNota: dto.reglas_acreditacion.regularidad.min_nota ?? 4.0,
          minAsistencia: dto.reglas_acreditacion.regularidad.min_asistencia ?? 75,
          permiteRecuperatorio: dto.reglas_acreditacion.regularidad.permite_recuperatorio ?? true,
          descripcion: dto.reglas_acreditacion.regularidad.descripcion ||
            'Todos los parciales ≥ 4.0 y 75% de asistencia mínima.'
        }
      };
    } else if (extra?.reglasAcreditacion) {
      reglasAcreditacion = extra.reglasAcreditacion;
    } else {
      reglasAcreditacion = {
        promocion: {
          permitePromocion: true,
          minPromedio: 8.0,
          minParcial: 7.0,
          permiteRecuperatorio: false,
          minAsistencia: 80,
          descripcion: 'Promedio ≥ 8.0, notas parciales ≥ 7.0 sin recuperatorio.'
        },
        regularidad: {
          minNota: 4.0,
          minAsistencia: 75,
          permiteRecuperatorio: true,
          descripcion: 'Todos los parciales ≥ 4.0 y 75% de asistencia mínima.'
        }
      };
    }

    return {
      id: dto.id,
      codigo: dto.codigo || `MAT-${dto.id.slice(0, 4).toUpperCase()}`,
      nombre: dto.nombre,
      anio: dto.anio,
      cuatrimestre: cuatrimestreMap[dto.cuatrimestre] || '1C',
      estado: dto.estado,
      color: dto.color || '#2563eb',
      comision: dto.comision || 'Comisión Única',
      modalidad: dto.modalidad || 'Presencial',
      promedio: dto.promedio ?? 0,
      profesores: extra?.profesores || {
        titular: 'Docente Titular',
        jtp: 'Docente Auxiliar'
      },
      reglasAcreditacion,
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
      comision: materia.comision,
      modalidad: materia.modalidad,
      promedio: materia.promedio,
      reglas_acreditacion: materia.reglasAcreditacion ? {
        promocion: {
          permite_promocion: materia.reglasAcreditacion.promocion.permitePromocion ?? true,
          min_promedio: materia.reglasAcreditacion.promocion.minPromedio,
          min_parcial: materia.reglasAcreditacion.promocion.minParcial,
          permite_recuperatorio: materia.reglasAcreditacion.promocion.permiteRecuperatorio,
          min_asistencia: materia.reglasAcreditacion.promocion.minAsistencia ?? 80,
          descripcion: materia.reglasAcreditacion.promocion.descripcion
        },
        regularidad: {
          min_nota: materia.reglasAcreditacion.regularidad.minNota,
          min_asistencia: materia.reglasAcreditacion.regularidad.minAsistencia,
          permite_recuperatorio: materia.reglasAcreditacion.regularidad.permiteRecuperatorio ?? true,
          descripcion: materia.reglasAcreditacion.regularidad.descripcion
        }
      } : undefined
    };
  }
};
