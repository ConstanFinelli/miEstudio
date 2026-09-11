import { useState, useEffect, useMemo } from 'react';
import { useMaterias, usePerfil } from '../../../hooks';
import { useAuth } from '../../../context/AuthContext';
import { carrerasService } from '../../../services/carrerasService';
import type { AprobacionHistorica } from '../../../types/auth';

export interface AnioEstadistica {
  anio: number;
  count: number;
  promedio: number;
  acumulado: number;
  materias: { nombre: string; nota: number; tipo: string }[];
}

export interface ModalidadesStats {
  promocion: number;
  finalRegular: number;
  equivalenciaLibre: number;
  total: number;
  porcentajePromocion: number;
}

export interface DistribucionNotasStats {
  sobresaliente: number; // 10
  distinguido: number;   // 8 - 9
  bueno: number;         // 6 - 7
  aprobado: number;      // 4 - 5
  totalConNota: number;
  tasaExcelencia: number; // >= 8
  notaMaxima: number;
  materiaNotaMaxima: string;
}

export interface HitoNivel {
  nivel: number;
  nombreNivel: string;
  totalMaterias: number;
  aprobadas: number;
  completado: boolean;
  porcentaje: number;
  fechaLiquidacion?: string;
}

export interface StatsRitmo {
  totalPlan: number;
  totalAprobadas: number;
  progresoPercent: number;
  materiasRestantes: number;
  cantAniosActivos: number;
  velocidadAnual: number;
}

export const useProgresoAcademico = () => {
  const { materias, isLoading: loadingMaterias } = useMaterias();
  const { perfil } = usePerfil();
  const { activeCarrera } = useAuth();
  const [aprobaciones, setAprobaciones] = useState<AprobacionHistorica[]>([]);
  const [loadingAprobaciones, setLoadingAprobaciones] = useState(false);

  // Cargar aprobaciones históricas de la carrera activa
  useEffect(() => {
    if (!activeCarrera?.id) {
      setAprobaciones([]);
      return;
    }

    let isMounted = true;
    setLoadingAprobaciones(true);
    carrerasService
      .getAprobaciones(activeCarrera.id)
      .then((list) => {
        if (isMounted) setAprobaciones(list || []);
      })
      .catch(() => {
        if (isMounted) setAprobaciones([]);
      })
      .finally(() => {
        if (isMounted) setLoadingAprobaciones(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCarrera?.id]);

  // Escuchar eventos globales de actualización de materias
  useEffect(() => {
    const handleUpdate = () => {
      if (activeCarrera?.id) {
        carrerasService.getAprobaciones(activeCarrera.id).then((list) => {
          setAprobaciones(list || []);
        }).catch(() => {});
      }
    };
    window.addEventListener('materias:updated', handleUpdate);
    return () => window.removeEventListener('materias:updated', handleUpdate);
  }, [activeCarrera?.id]);

  // Consolidar materias aprobadas combinando aprobaciones históricas y estado de materias
  const aprobadasConsolidadas = useMemo(() => {
    const mapAprobaciones = new Map(aprobaciones.map((a) => [a.materia_id, a]));
    const aprobadas = materias.filter(
      (m) => m.estado === 'APROBADA' || m.estado === 'PROMOCIONADA'
    );

    return aprobadas.map((mat) => {
      const hist = mapAprobaciones.get(mat.id);
      let fechaAprob = hist?.fecha_aprobacion;
      let anioCal = new Date().getFullYear();

      if (fechaAprob) {
        const parsedYear = parseInt(fechaAprob.split('-')[0], 10);
        if (!isNaN(parsedYear) && parsedYear > 1990) {
          anioCal = parsedYear;
        }
      }

      const nota = hist?.nota_final || mat.promedio || 8;
      const tipo = hist?.tipo_aprobacion || (mat.estado === 'PROMOCIONADA' ? 'PROMOCION' : 'FINAL');

      return {
        materiaId: mat.id,
        nombre: mat.nombre,
        codigo: mat.codigo,
        nivelPlan: mat.anio || 1,
        nota,
        tipo,
        fechaAprobacion: fechaAprob || `${anioCal}-12-31`,
        anioCalendario: anioCal,
      };
    });
  }, [materias, aprobaciones]);

  // 1. Estadísticas de Ritmo y Avance
  const statsRitmo = useMemo<StatsRitmo>(() => {
    const totalPlan =
      materias.length === 0
        ? 0
        : (activeCarrera?.total_materias_plan && activeCarrera.total_materias_plan > 0
            ? Math.max(activeCarrera.total_materias_plan, materias.length)
            : (perfil?.materiasTotales && perfil.materiasTotales > 0
                ? Math.max(perfil.materiasTotales, materias.length)
                : materias.length));
    const totalAprobadas = aprobadasConsolidadas.length;
    const progresoPercent = totalPlan > 0 ? Math.min(100, Math.round((totalAprobadas / totalPlan) * 100)) : 0;
    const materiasRestantes = Math.max(0, totalPlan - totalAprobadas);

    // Agrupación por año calendario
    const aniosSet = new Set(aprobadasConsolidadas.map((a) => a.anioCalendario));
    const aniosList = Array.from(aniosSet).sort((a, b) => a - b);
    const cantAniosActivos = Math.max(1, aniosList.length);
    const velocidadAnual = Number((totalAprobadas / cantAniosActivos).toFixed(1));

    return {
      totalPlan,
      totalAprobadas,
      progresoPercent,
      materiasRestantes,
      cantAniosActivos,
      velocidadAnual,
    };
  }, [aprobadasConsolidadas, activeCarrera, perfil, materias]);

  // 2. Evolución temporal por año lectivo (Curva Burnup y Promedio Anual)
  const evolucionPorAnio = useMemo(() => {
    const mapAnios: Record<number, { count: number; sumNotas: number; materias: { nombre: string; nota: number; tipo: string }[] }> = {};

    aprobadasConsolidadas.forEach((aprob) => {
      const yr = aprob.anioCalendario;
      if (!mapAnios[yr]) {
        mapAnios[yr] = { count: 0, sumNotas: 0, materias: [] };
      }
      mapAnios[yr].count += 1;
      mapAnios[yr].sumNotas += aprob.nota;
      mapAnios[yr].materias.push({
        nombre: aprob.nombre,
        nota: aprob.nota,
        tipo: aprob.tipo,
      });
    });

    const aniosOrdenados = Object.keys(mapAnios)
      .map(Number)
      .sort((a, b) => a - b);

    let acumulador = 0;
    const result: AnioEstadistica[] = aniosOrdenados.map((yr) => {
      const data = mapAnios[yr];
      acumulador += data.count;
      const promedio = Number((data.sumNotas / data.count).toFixed(2));
      return {
        anio: yr,
        count: data.count,
        promedio,
        acumulado: acumulador,
        materias: data.materias,
      };
    });

    return result;
  }, [aprobadasConsolidadas]);

  // 3. Modalidades de Acreditación (Promoción vs Final vs Equivalencia)
  const modalidadesStats = useMemo<ModalidadesStats>(() => {
    let promo = 0;
    let finalReg = 0;
    let equivLibre = 0;

    aprobadasConsolidadas.forEach((a) => {
      const t = a.tipo.toUpperCase();
      if (t.includes('PROMOCION') || t === 'PROMOCIONADA') promo += 1;
      else if (t.includes('FINAL') || t === 'EXAMEN') finalReg += 1;
      else equivLibre += 1;
    });

    const total = aprobadasConsolidadas.length;
    const porcentajePromocion = total > 0 ? Math.round((promo / total) * 100) : 0;

    return {
      promocion: promo,
      finalRegular: finalReg,
      equivalenciaLibre: equivLibre,
      total,
      porcentajePromocion,
    };
  }, [aprobadasConsolidadas]);

  // 4. Histograma y Distribución de Notas
  const distribucionNotas = useMemo<DistribucionNotasStats>(() => {
    let sob = 0;
    let dist = 0;
    let bueno = 0;
    let apr = 0;
    let max = 0;
    let maxMat = '';

    aprobadasConsolidadas.forEach((a) => {
      const n = a.nota;
      if (n > max) {
        max = n;
        maxMat = a.nombre;
      }
      if (n >= 9.5) sob += 1;
      else if (n >= 8.0) dist += 1;
      else if (n >= 6.0) bueno += 1;
      else if (n >= 4.0) apr += 1;
    });

    const total = aprobadasConsolidadas.length;
    const excelentes = sob + dist;
    const tasaExcelencia = total > 0 ? Math.round((excelentes / total) * 100) : 0;

    return {
      sobresaliente: sob,
      distinguido: dist,
      bueno,
      aprobado: apr,
      totalConNota: total,
      tasaExcelencia,
      notaMaxima: max,
      materiaNotaMaxima: maxMat,
    };
  }, [aprobadasConsolidadas]);

  // 5. Hitos por Nivel (1° a 5°/6° año del plan)
  const hitosPorNivel = useMemo<HitoNivel[]>(() => {
    const nivelesSet = new Set(materias.map((m) => m.anio || 1));
    const niveles = Array.from(nivelesSet).sort((a, b) => a - b);
    if (niveles.length === 0) return [];

    return niveles.map((nvl) => {
      const materiasDelNivel = materias.filter((m) => (m.anio || 1) === nvl);
      const aprobadasDelNivel = aprobadasConsolidadas.filter((a) => a.nivelPlan === nvl);
      const total = materiasDelNivel.length;
      const cantAprob = aprobadasDelNivel.length;
      const completado = total > 0 && cantAprob >= total;
      const porcentaje = total > 0 ? Math.min(100, Math.round((cantAprob / total) * 100)) : 0;

      // Fecha de la última materia aprobada de ese nivel
      let fechaLiquidacion: string | undefined;
      if (completado && aprobadasDelNivel.length > 0) {
        const fechas = aprobadasDelNivel
          .map((a) => a.fechaAprobacion)
          .sort((d1, d2) => new Date(d2).getTime() - new Date(d1).getTime());
        fechaLiquidacion = fechas[0];
      }

      return {
        nivel: nvl,
        nombreNivel: `${nvl}° Año`,
        totalMaterias: total,
        aprobadas: cantAprob,
        completado,
        porcentaje,
        fechaLiquidacion,
      };
    });
  }, [materias, aprobadasConsolidadas]);

  return {
    materiasAprobadas: aprobadasConsolidadas,
    statsRitmo,
    evolucionPorAnio,
    modalidadesStats,
    distribucionNotas,
    hitosPorNivel,
    activeCarrera,
    perfil,
    isLoading: loadingMaterias || loadingAprobaciones,
  };
};
