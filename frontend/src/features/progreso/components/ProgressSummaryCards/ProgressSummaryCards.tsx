import React from 'react';
import styles from './ProgressSummaryCards.module.css';
import { GraduationCap, Zap, CalendarCheck, Award } from 'lucide-react';

interface ProgressSummaryCardsProps {
  statsRitmo: {
    totalPlan: number;
    totalAprobadas: number;
    progresoPercent: number;
    materiasRestantes: number;
    velocidadAnual: number;
    anioEstimadoGraduacion: number;
  };
  modalidadesStats: {
    promocion: number;
    total: number;
    porcentajePromocion: number;
  };
}

export const ProgressSummaryCards: React.FC<ProgressSummaryCardsProps> = ({
  statsRitmo,
  modalidadesStats
}) => {
  return (
    <div className={styles.kpiGrid}>
      {/* 1. Avance del Plan de Estudios */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel}>Avance del Plan</span>
            <span className={styles.kpiSub}>Progreso total de materias</span>
          </div>
          <div className={styles.kpiIconBox}>
            <GraduationCap size={15} />
          </div>
        </div>

        <div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue}>{statsRitmo.progresoPercent}%</span>
            <span className={styles.kpiUnit}>acreditado</span>
            <span className={styles.kpiBadge}>
              {statsRitmo.totalAprobadas} / {statsRitmo.totalPlan}
            </span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${statsRitmo.progresoPercent}%` }}
            />
          </div>
        </div>

        <div className={styles.kpiFooter}>
          <span>{statsRitmo.materiasRestantes} materias restantes</span>
          <span style={{ color: 'var(--emerald)' }}>
            {statsRitmo.totalAprobadas > 0 ? 'En curso activo' : 'Por iniciar'}
          </span>
        </div>
      </div>

      {/* 2. Velocidad de Avance */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel}>Velocidad de Avance</span>
            <span className={styles.kpiSub}>Promedio por año lectivo</span>
          </div>
          <div className={styles.kpiIconBox}>
            <Zap size={15} />
          </div>
        </div>

        <div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue}>{statsRitmo.velocidadAnual}</span>
            <span className={styles.kpiUnit}>materias / año</span>
          </div>
        </div>

        <div className={styles.kpiFooter}>
          <span>Basado en años cursados</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            ~{(statsRitmo.velocidadAnual / 2).toFixed(1)} por cuatrimestre
          </span>
        </div>
      </div>

      {/* 3. Proyección de Graduación */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel}>Proyección de Egreso</span>
            <span className={styles.kpiSub}>Estimación al ritmo actual</span>
          </div>
          <div className={styles.kpiIconBox}>
            <CalendarCheck size={15} />
          </div>
        </div>

        <div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue}>
              {statsRitmo.materiasRestantes === 0
                ? '¡Egresado!'
                : statsRitmo.totalAprobadas > 0
                ? `${statsRitmo.anioEstimadoGraduacion}`
                : '---'}
            </span>
            {statsRitmo.materiasRestantes > 0 && statsRitmo.totalAprobadas > 0 && (
              <span className={styles.kpiUnit}>estimado</span>
            )}
          </div>
        </div>

        <div className={styles.kpiFooter}>
          {statsRitmo.materiasRestantes === 0 ? (
            <span style={{ color: 'var(--emerald)' }}>Plan completado</span>
          ) : statsRitmo.totalAprobadas > 0 ? (
            <span>
              ~{Math.max(1, statsRitmo.anioEstimadoGraduacion - new Date().getFullYear())} años restantes
            </span>
          ) : (
            <span>Requiere materias aprobadas</span>
          )}
          <span style={{ color: 'var(--primary-glow)' }}>Ritmo constante</span>
        </div>
      </div>

      {/* 4. Ahorro de Finales por Promoción */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel}>Tasa de Promoción</span>
            <span className={styles.kpiSub}>Finales evitados por cursada</span>
          </div>
          <div className={styles.kpiIconBox}>
            <Award size={15} />
          </div>
        </div>

        <div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue}>{modalidadesStats.porcentajePromocion}%</span>
            <span className={styles.kpiUnit}>de aprobaciones</span>
          </div>
        </div>

        <div className={styles.kpiFooter}>
          <span>{modalidadesStats.promocion} de {modalidadesStats.total} materias</span>
          <span style={{ color: 'var(--emerald)' }}>Promoción directa</span>
        </div>
      </div>
    </div>
  );
};
