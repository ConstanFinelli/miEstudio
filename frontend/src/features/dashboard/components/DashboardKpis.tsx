import React from 'react';
import styles from '../DashboardView.module.css';
import {
  Calculator,
  GraduationCap,
  Layers,
  Flame,
  TrendingUp
} from 'lucide-react';
import { usePerfil, useMaterias, useEvaluaciones } from '../../../hooks';

interface DashboardKpisProps {
  onGoToMaterias: () => void;
  onGoToCalendario: () => void;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({
  onGoToMaterias,
  onGoToCalendario
}) => {
  const { perfil } = usePerfil();
  const { materias } = useMaterias();
  const { proximas } = useEvaluaciones();

  const activeSubjects = materias.filter(m => m.estado === 'CURSANDO');
  const nextCritical = proximas.length > 0 ? proximas[0] : null;

  if (!perfil) return null;
  return (
    <div className={styles.kpiGrid}>
      {/* KPI 1: Promedio General */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel}>Promedio General</span>
            <span className={styles.kpiSub}>Escala oficial (1 - 10)</span>
          </div>
          <div className={styles.kpiIconBox}>
            <Calculator size={15} />
          </div>
        </div>
        <div className={styles.kpiValueRow}>
          <span className={styles.kpiMainValue}>{perfil.promedioGeneral.toFixed(2)}</span>
          <span className={styles.kpiSubValue}>/ 10.0</span>
          <span className={styles.deltaBadge}>
            <TrendingUp size={11} />
            +{perfil.deltaPromedio} vs ciclo anterior
          </span>
        </div>
        <div className={styles.kpiFooter}>
          <span>Puesto: #{perfil.puestoCohorte} en cohorte</span>
          <span>Percentil {perfil.percentil}%</span>
        </div>
      </div>

      {/* KPI 2: Progreso de Carrera */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel}>Progreso de Carrera</span>
            <span className={styles.kpiSub}>
              {perfil.materiasAprobadas} de {perfil.materiasTotales} materias aprobadas
            </span>
          </div>
          <div className={styles.kpiIconBox}>
            <GraduationCap size={15} />
          </div>
        </div>
        <div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue}>
              {Math.round((perfil.materiasAprobadas / (perfil.materiasTotales || 1)) * 100)}%
            </span>
            <span className={styles.kpiSubValue}>
              {perfil.materiasTotales - perfil.materiasAprobadas} pendientes
            </span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${(perfil.materiasAprobadas / (perfil.materiasTotales || 1)) * 100}%` }}
            />
          </div>
        </div>
        <div className={styles.kpiFooter}>
          <span>Tesina habilitada al 75%</span>
          <span>{perfil.materiasTotales - perfil.materiasAprobadas} materias para graduación</span>
        </div>
      </div>

      {/* KPI 3: Materias en Curso */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel}>Materias en Curso</span>
            <span className={styles.kpiSub}>En curso regular</span>
          </div>
          <div className={styles.kpiIconBox}>
            <Layers size={15} />
          </div>
        </div>
        <div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue}>{activeSubjects.length}</span>
            <span style={{ fontSize: '12px', color: 'var(--emerald)' }}>Todas regulares al día</span>
          </div>
          <div className={styles.subjectPills}>
            {activeSubjects.slice(0, 4).map(subj => (
              <span key={subj.id} className={styles.subjectMiniPill} title={subj.nombre}>
                {subj.codigo || subj.nombre.slice(0, 4)}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.kpiFooter}>
          <span>Carga semanal: {activeSubjects.length * 6} hs</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary-glow)' }} onClick={onGoToMaterias}>
            Ver detalle →
          </span>
        </div>
      </div>

      {/* KPI 4: Atención Inmediata */}
      <div className={styles.kpiCard} style={{ borderLeft: '3px solid var(--red)' }}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel} style={{ color: 'var(--red)' }}>Atención Inmediata</span>
            <span className={styles.kpiSub}>Próxima evaluación crítica</span>
          </div>
          <div className={styles.kpiIconBox} style={{ color: 'var(--red)' }}>
            <Flame size={15} />
          </div>
        </div>
        <div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue} style={{ color: 'var(--red)' }}>
              {nextCritical ? `${nextCritical.peso}%` : 'Al día'}
            </span>
            <span className={styles.kpiSubValue}>
              {nextCritical ? `${nextCritical.titulo}` : 'Sin exámenes pendientes'}
            </span>
          </div>
          <div className={styles.sparklineContainer}>
            <svg viewBox="0 0 100 20" className={styles.sparklineSvg}>
              <path
                d="M 0,15 Q 25,5 50,12 T 100,2"
                fill="none"
                stroke="var(--red)"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
        <div className={styles.kpiFooter}>
          <span style={{ color: 'var(--text-muted)' }}>Requiere repaso intensivo</span>
          <span
            style={{ cursor: 'pointer', color: 'var(--primary-glow)' }}
            onClick={onGoToCalendario}
          >
            Ver fechas →
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardKpis;
