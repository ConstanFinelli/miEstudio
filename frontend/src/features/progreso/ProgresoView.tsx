import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useProgresoAcademico } from './hooks/useProgresoAcademico';
import {
  ProgressSummaryCards,
  CareerBurnupChart,
  YearlyAverageChart,
  ApprovalModalityChart,
  GradeDistributionChart,
  MilestonesTimeline,
} from './components';
import styles from './ProgresoView.module.css';

export const ProgresoView: React.FC = () => {
  const navigate = useNavigate();
  const {
    statsRitmo,
    evolucionPorAnio,
    modalidadesStats,
    distribucionNotas,
    hitosPorNivel,
    activeCarrera,
    perfil,
    isLoading,
  } = useProgresoAcademico();

  const carreraNombre = activeCarrera?.nombre || perfil?.carrera || 'Carrera Universitaria';
  const institucion = activeCarrera?.facultad_sede || 'Facultad';
  const promedioGeneral = activeCarrera?.promedio_general ?? perfil?.promedioGeneral ?? 0;

  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerTagRow}>
            <span className={styles.headerBadge}>ANALÍTICA ACADÉMICA</span>
            <span className={styles.headerCareer}>{institucion}</span>
          </div>
          <h1 className={styles.headerTitle}>Progreso & Estadísticas</h1>
          <p className={styles.headerDesc}>
            Métricas de avance curricular, ritmo de aprobación, calificaciones y proyección para{' '}
            <strong>{carreraNombre}</strong>.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.btnAction}
            onClick={() => navigate('/materias')}
            title="Ir al listado y gestión de asignaturas"
          >
            <BookOpen size={14} />
            <span>Gestionar Asignaturas</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <span>Calculando métricas académicas...</span>
        </div>
      ) : (
        <>
          {/* 2. Top Summary KPI Cards */}
          <ProgressSummaryCards
            statsRitmo={statsRitmo}
            modalidadesStats={modalidadesStats}
          />

          {/* 3. Temporal Progression Grid (Burn-up & Average by Year) */}
          <div className={styles.chartsGrid}>
            <CareerBurnupChart
              evolucionPorAnio={evolucionPorAnio}
              totalPlan={statsRitmo.totalPlan}
            />
            <YearlyAverageChart
              evolucionPorAnio={evolucionPorAnio}
              promedioGeneral={promedioGeneral}
            />
          </div>

          {/* 4. Academic Quality & Accreditation Modalities Grid */}
          <div className={styles.chartsGrid}>
            <ApprovalModalityChart stats={modalidadesStats} />
            <GradeDistributionChart stats={distribucionNotas} />
          </div>

          {/* 5. Milestones & Level Timeline */}
          <MilestonesTimeline hitos={hitosPorNivel} />
        </>
      )}
    </div>
  );
};
