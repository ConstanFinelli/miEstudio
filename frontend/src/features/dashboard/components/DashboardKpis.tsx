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

  const hasPromedio = perfil.promedioGeneral > 0;
  const hasPlan = perfil.materiasTotales > 0;
  const progressPercent = hasPlan ? Math.round((perfil.materiasAprobadas / perfil.materiasTotales) * 100) : 0;

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
          <span className={styles.kpiMainValue}>{hasPromedio ? perfil.promedioGeneral.toFixed(2) : '--'}</span>
          <span className={styles.kpiSubValue}>/ 10.0</span>
          {perfil.deltaPromedio !== 0 ? (
            <span className={styles.deltaBadge}>
              <TrendingUp size={11} />
              +{perfil.deltaPromedio} vs ciclo anterior
            </span>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              {hasPromedio ? 'Ciclo actual' : 'Sin notas cargadas'}
            </span>
          )}
        </div>
        <div className={styles.kpiFooter}>
          {perfil.puestoCohorte > 0 ? (
            <>
              <span>Puesto: #{perfil.puestoCohorte} en cohorte</span>
              <span>Percentil {perfil.percentil}%</span>
            </>
          ) : (
            <>
              <span>Régimen regular</span>
              <span>En curso</span>
            </>
          )}
        </div>
      </div>

      {/* KPI 2: Progreso de Carrera */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel}>Progreso de Carrera</span>
            <span className={styles.kpiSub}>
              {hasPlan
                ? `${perfil.materiasAprobadas} de ${perfil.materiasTotales} materias aprobadas`
                : 'Plan de carrera'}
            </span>
          </div>
          <div className={styles.kpiIconBox}>
            <GraduationCap size={15} />
          </div>
        </div>
        <div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue}>{progressPercent}%</span>
            <span className={styles.kpiSubValue}>
              {hasPlan ? `${perfil.materiasTotales - perfil.materiasAprobadas} pendientes` : 'Por iniciar'}
            </span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className={styles.kpiFooter}>
          {hasPlan ? (
            <>
              <span>Tesina habilitada al 75%</span>
              <span>{perfil.materiasTotales - perfil.materiasAprobadas} para graduación</span>
            </>
          ) : (
            <>
              <span>Sin materias aprobadas aún</span>
              <span style={{ cursor: 'pointer', color: 'var(--primary-glow)' }} onClick={onGoToMaterias}>
                Ver materias →
              </span>
            </>
          )}
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
            <span style={{ fontSize: '12px', color: activeSubjects.length > 0 ? 'var(--emerald)' : 'var(--text-dim)' }}>
              {activeSubjects.length > 0 ? 'Todas regulares al día' : 'Sin materias activas'}
            </span>
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

      {/* KPI 4: Atención Inmediata / Próxima Evaluación */}
      <div className={styles.kpiCard} style={{ borderLeft: nextCritical ? '3px solid var(--red)' : '3px solid var(--emerald)' }}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel} style={{ color: nextCritical ? 'var(--red)' : 'var(--emerald)' }}>
              {nextCritical ? 'Atención Inmediata' : 'Cronograma al Día'}
            </span>
            <span className={styles.kpiSub}>
              {nextCritical ? 'Próxima evaluación crítica' : 'Próximas fechas'}
            </span>
          </div>
          <div className={styles.kpiIconBox} style={{ color: nextCritical ? 'var(--red)' : 'var(--emerald)' }}>
            <Flame size={15} />
          </div>
        </div>
        <div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue} style={{ color: nextCritical ? 'var(--red)' : 'var(--text-primary)' }}>
              {nextCritical ? `${nextCritical.peso}%` : 'Al día'}
            </span>
            <span className={styles.kpiSubValue}>
              {nextCritical ? `${nextCritical.titulo}` : 'Sin exámenes pendientes'}
            </span>
          </div>
          <div className={styles.sparklineContainer}>
            <svg viewBox="0 0 100 20" className={styles.sparklineSvg}>
              <path
                d={nextCritical ? "M 0,15 Q 25,5 50,12 T 100,2" : "M 0,10 L 100,10"}
                fill="none"
                stroke={nextCritical ? "var(--red)" : "var(--border-subtle)"}
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
        <div className={styles.kpiFooter}>
          <span style={{ color: 'var(--text-muted)' }}>
            {nextCritical ? 'Requiere repaso' : 'Calendario despejado'}
          </span>
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
