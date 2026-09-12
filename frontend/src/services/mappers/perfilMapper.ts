import type { PerfilDTO } from '../types';
import type { PerfilEstudiante } from '../../types/academic';

export const perfilMapper = {
  toPerfil(dto: PerfilDTO): PerfilEstudiante {
    return {
      nombre: dto.nombre,
      legajo: dto.legajo,
      carrera: dto.carrera,
      semestreActual: dto.semestre_actual,
      cicloActivo: dto.ciclo_activo || '1C 2026',
      promedioGeneral: dto.promedio_general,
      deltaPromedio: dto.delta_promedio ?? 0,
      puestoCohorte: dto.puesto_cohorte ?? 0,
      percentil: dto.percentil ?? 0,
      materiasAprobadas: dto.materias_aprobadas,
      materiasTotales: dto.materias_totales,
      creditosAprobados: dto.creditos_aprobados,
      creditosTotales: dto.creditos_totales,
      promedioHistorico: dto.promedio_historico || []
    };
  }
};
