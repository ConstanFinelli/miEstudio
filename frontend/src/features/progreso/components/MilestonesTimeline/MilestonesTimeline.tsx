import React from 'react';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';
import type { HitoNivel } from '../../hooks/useProgresoAcademico';
import styles from './MilestonesTimeline.module.css';

interface MilestonesTimelineProps {
  hitos: HitoNivel[];
}

export const MilestonesTimeline: React.FC<MilestonesTimelineProps> = ({ hitos }) => {
  if (hitos.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.label}>HITOS POR NIVEL DEL PLAN</span>
            <span className={styles.sub}>Progreso año por año de la carrera</span>
          </div>
        </div>
        <div className={styles.emptyState}>
          No se encontraron asignaturas organizadas por niveles en el plan de estudios.
        </div>
      </div>
    );
  }

  const formatFechaHito = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const year = parts[0];
    if (parts[1] === '12' && parts[2] === '31') {
      return `Año ${year}`;
    }
    const d = new Date(`${dateStr}T12:00:00`);
    if (isNaN(d.getTime())) return year;
    const formatted = d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const totalCompletados = hitos.filter((h) => h.completado).length;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.label}>HITOS POR NIVEL DEL PLAN</span>
          <span className={styles.sub}>
            Cumplimiento de asignaturas por año lectivo de la carrera ({totalCompletados} de {hitos.length} años completados)
          </span>
        </div>
      </div>

      <div className={styles.timelineGrid}>
        {hitos.map((hito) => {
          const restantes = Math.max(0, hito.totalMaterias - hito.aprobadas);

          return (
            <div
              key={hito.nivel}
              className={`${styles.levelCard} ${hito.completado ? styles.levelCardCompleted : ''}`}
            >
              <div className={styles.levelHeader}>
                <div className={styles.levelTitleRow}>
                  <span
                    className={`${styles.levelBadge} ${hito.completado ? styles.levelBadgeCompleted : ''}`}
                  >
                    {hito.nombreNivel}
                  </span>
                </div>
                {hito.completado ? (
                  <CheckCircle2 size={18} className={styles.levelStatusIconCompleted} />
                ) : (
                  <Clock size={16} className={styles.levelStatusIconPending} />
                )}
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressFill} ${hito.completado ? styles.progressFillCompleted : ''}`}
                  style={{ width: `${hito.porcentaje}%` }}
                />
              </div>

              <div className={styles.levelFooter}>
                <span className={styles.levelCount}>
                  {hito.aprobadas}/{hito.totalMaterias} materias ({hito.porcentaje}%)
                </span>

                {hito.completado && hito.fechaLiquidacion ? (
                  <span className={styles.levelCompletionDate} title={`Completado: ${hito.fechaLiquidacion}`}>
                    <Calendar size={12} /> {formatFechaHito(hito.fechaLiquidacion)}
                  </span>
                ) : (
                  <span className={styles.levelRemaining}>
                    {restantes === 1 ? 'Falta 1 materia' : `Faltan ${restantes} materias`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
