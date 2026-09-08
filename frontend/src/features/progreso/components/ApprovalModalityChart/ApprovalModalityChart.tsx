import React from 'react';
import { Award, BookOpen, Repeat, Sparkles } from 'lucide-react';
import type { ModalidadesStats } from '../../hooks/useProgresoAcademico';
import styles from './ApprovalModalityChart.module.css';

interface ApprovalModalityChartProps {
  stats: ModalidadesStats;
}

export const ApprovalModalityChart: React.FC<ApprovalModalityChartProps> = ({ stats }) => {
  const { total, promocion, finalRegular, equivalenciaLibre, porcentajePromocion } = stats;

  if (total === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.label}>MODALIDADES DE ACREDITACIÓN</span>
            <span className={styles.sub}>Acreditación de asignaturas</span>
          </div>
        </div>
        <div className={styles.emptyState}>
          Aún no se registran materias aprobadas para analizar modalidades.
        </div>
      </div>
    );
  }

  const promoPercent = Math.round((promocion / total) * 100);
  const finalPercent = Math.round((finalRegular / total) * 100);
  const equivPercent = Math.max(0, 100 - promoPercent - finalPercent);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.label}>MODALIDADES DE ACREDITACIÓN</span>
          <span className={styles.sub}>Promoción directa vs. Mesas de examen final</span>
        </div>
        <span className={styles.totalBadge}>{total} aprobadas</span>
      </div>

      {promocion > 0 && (
        <div className={styles.insightBanner}>
          <Sparkles size={18} className={styles.insightIcon} />
          <span className={styles.insightText}>
            <span className={styles.insightBold}>¡Eficacia en cursadas! </span>
            Aprobaste el <span className={styles.insightBold}>{porcentajePromocion}%</span> de tus materias por Promoción Directa, habiéndote ahorrado rendir <span className={styles.insightBold}>{promocion} exámenes finales</span>.
          </span>
        </div>
      )}

      {/* Stacked multi-segment bar */}
      <div className={styles.stackedBarContainer}>
        <div className={styles.stackedBar}>
          {promocion > 0 && (
            <div
              className={styles.segmentPromo}
              style={{ width: `${(promocion / total) * 100}%` }}
              title={`Promoción: ${promocion} (${promoPercent}%)`}
            />
          )}
          {finalRegular > 0 && (
            <div
              className={styles.segmentFinal}
              style={{ width: `${(finalRegular / total) * 100}%` }}
              title={`Final Regular: ${finalRegular} (${finalPercent}%)`}
            />
          )}
          {equivalenciaLibre > 0 && (
            <div
              className={styles.segmentEquiv}
              style={{ width: `${(equivalenciaLibre / total) * 100}%` }}
              title={`Equivalencia/Libre: ${equivalenciaLibre} (${equivPercent}%)`}
            />
          )}
        </div>
      </div>

      {/* Grid of 3 modalities */}
      <div className={styles.modalitiesGrid}>
        <div className={`${styles.modalityCard} ${styles.modalityPromo}`}>
          <div className={styles.modalityHeader}>
            <span className={styles.modalityType}>
              <Award size={14} /> Promoción
            </span>
          </div>
          <div className={styles.modalityCount}>
            {promocion}
            <span className={styles.modalityUnit}>materias</span>
          </div>
          <div className={styles.modalityFooter}>
            <span>Sin mesa de final</span>
            <span className={styles.modalityPercent}>{promoPercent}%</span>
          </div>
        </div>

        <div className={`${styles.modalityCard} ${styles.modalityFinal}`}>
          <div className={styles.modalityHeader}>
            <span className={styles.modalityType}>
              <BookOpen size={14} /> Final Regular
            </span>
          </div>
          <div className={styles.modalityCount}>
            {finalRegular}
            <span className={styles.modalityUnit}>materias</span>
          </div>
          <div className={styles.modalityFooter}>
            <span>Cursada + Examen</span>
            <span className={styles.modalityPercent}>{finalPercent}%</span>
          </div>
        </div>

        <div className={`${styles.modalityCard} ${styles.modalityEquiv}`}>
          <div className={styles.modalityHeader}>
            <span className={styles.modalityType}>
              <Repeat size={14} /> Equivalencia / Libre
            </span>
          </div>
          <div className={styles.modalityCount}>
            {equivalenciaLibre}
            <span className={styles.modalityUnit}>materias</span>
          </div>
          <div className={styles.modalityFooter}>
            <span>Homologación o libre</span>
            <span className={styles.modalityPercent}>{equivPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
