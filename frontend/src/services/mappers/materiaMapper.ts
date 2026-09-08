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
      const p = dto.reglas_acreditacion.promocion;
      const r = dto.reglas_acreditacion.regularidad;

      const promoCond = p.condicion || p.descripcion ||
        (p.permite_promocion === false
          ? 'Sin promoción directa. Examen final obligatorio.'
          : 'Promedio ≥ 8.0 y parciales ≥ 7.0 sin recuperatorio.');

      const reguCond = r.condicion || r.descripcion ||
        'Todos los parciales ≥ 4.0 y requisitos de cátedra cumplidos.';

      reglasAcreditacion = {
        promocion: {
          permitePromocion: p.permite_promocion ?? true,
          condicion: promoCond,
          minPromedio: p.min_promedio,
          minParcial: p.min_parcial,
          permiteRecuperatorio: p.permite_recuperatorio ?? false,
          minAsistencia: p.min_asistencia ?? 80,
          descripcion: promoCond
        },
        regularidad: {
          condicion: reguCond,
          minNota: r.min_nota,
          minAsistencia: r.min_asistencia ?? 75,
          permiteRecuperatorio: r.permite_recuperatorio ?? true,
          descripcion: reguCond
        }
      };
    } else if (extra?.reglasAcreditacion) {
      reglasAcreditacion = extra.reglasAcreditacion;
    } else {
      reglasAcreditacion = {
        promocion: {
          permitePromocion: true,
          condicion: 'Promedio ≥ 8.0 y notas parciales ≥ 7.0 (sin recuperatorio).',
          minPromedio: 8.0,
          minParcial: 7.0,
          permiteRecuperatorio: false,
          minAsistencia: 80,
          descripcion: 'Promedio ≥ 8.0 y notas parciales ≥ 7.0 (sin recuperatorio).'
        },
        regularidad: {
          condicion: 'Evaluaciones ≥ 4.0 y 75% de asistencia mínima requerida.',
          minNota: 4.0,
          minAsistencia: 75,
          permiteRecuperatorio: true,
          descripcion: 'Evaluaciones ≥ 4.0 y 75% de asistencia mínima requerida.'
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
      profesores: {
        titular: dto.profesor_titular !== undefined ? dto.profesor_titular : (extra?.profesores?.titular || ''),
        jtp: dto.profesor_jtp !== undefined ? dto.profesor_jtp : (extra?.profesores?.jtp || '')
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
      profesor_titular: materia.profesores?.titular,
      profesor_jtp: materia.profesores?.jtp,
      reglas_acreditacion: materia.reglasAcreditacion ? {
        promocion: {
          permite_promocion: materia.reglasAcreditacion.promocion.permitePromocion ?? true,
          condicion: materia.reglasAcreditacion.promocion.condicion,
          min_promedio: materia.reglasAcreditacion.promocion.minPromedio,
          min_parcial: materia.reglasAcreditacion.promocion.minParcial,
          permite_recuperatorio: materia.reglasAcreditacion.promocion.permiteRecuperatorio ?? false,
          min_asistencia: materia.reglasAcreditacion.promocion.minAsistencia ?? 80,
          descripcion: materia.reglasAcreditacion.promocion.descripcion || materia.reglasAcreditacion.promocion.condicion
        },
        regularidad: {
          condicion: materia.reglasAcreditacion.regularidad.condicion,
          min_nota: materia.reglasAcreditacion.regularidad.minNota,
          min_asistencia: materia.reglasAcreditacion.regularidad.minAsistencia ?? 75,
          permite_recuperatorio: materia.reglasAcreditacion.regularidad.permiteRecuperatorio ?? true,
          descripcion: materia.reglasAcreditacion.regularidad.descripcion || materia.reglasAcreditacion.regularidad.condicion
        }
      } : undefined
    };
  }
};
