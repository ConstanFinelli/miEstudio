import React from 'react';
import { Award, Trophy } from 'lucide-react';
import type { DistribucionNotasStats } from '../../hooks/useProgresoAcademico';
import styles from './GradeDistributionChart.module.css';

interface GradeDistributionChartProps {
  stats: DistribucionNotasStats;
}

export const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({ stats }) => {
  const {
    sobresaliente,
    distinguido,
    bueno,
    aprobado,
    totalConNota,
    tasaExcelencia,
    notaMaxima,
    materiaNotaMaxima,
  } = stats;

  if (totalConNota === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.label}>DISTRIBUCIÓN DE CALIFICACIONES</span>
            <span className={styles.sub}>Rango de notas obtenidas</span>
          </div>
        </div>
        <div className={styles.emptyState}>
          Aún no se registran notas de asignaturas aprobadas.
        </div>
      </div>
    );
  }

  const tiers = [
    {
      key: 'sobresaliente',
      name: 'Sobresaliente',
      range: 'Nota 10',
      count: sobresaliente,
      percent: Math.round((sobresaliente / totalConNota) * 100),
      rowClass: styles.tierSobresaliente,
      fillClass: styles.fillSobresaliente,
    },
    {
      key: 'distinguido',
      name: 'Distinguido',
      range: 'Notas 8 - 9',
      count: distinguido,
      percent: Math.round((distinguido / totalConNota) * 100),
      rowClass: styles.tierDistinguido,
      fillClass: styles.fillDistinguido,
    },
    {
      key: 'bueno',
      name: 'Bueno',
      range: 'Notas 6 - 7',
      count: bueno,
      percent: Math.round((bueno / totalConNota) * 100),
      rowClass: styles.tierBueno,
      fillClass: styles.fillBueno,
    },
    {
      key: 'aprobado',
      name: 'Aprobado',
      range: 'Notas 4 - 5',
      count: aprobado,
      percent: Math.round((aprobado / totalConNota) * 100),
      rowClass: styles.tierAprobado,
      fillClass: styles.fillAprobado,
    },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.label}>DISTRIBUCIÓN DE CALIFICACIONES</span>
          <span className={styles.sub}>Histograma de notas en asignaturas aprobadas</span>
        </div>
        <div className={styles.excelenciaBadge}>
          <Award size={14} />
          <span>{tasaExcelencia}% Excelencia (8-10)</span>
        </div>
      </div>

      <div className={styles.histogramList}>
        {tiers.map((tier) => (
          <div key={tier.key} className={`${styles.histogramRow} ${tier.rowClass}`}>
            <div className={styles.rowMeta}>
              <div className={styles.rowTierInfo}>
                <span className={styles.tierPill}>{tier.range}</span>
                <span className={styles.tierName}>{tier.name}</span>
              </div>
              <span className={styles.rowCounts}>
                <strong>{tier.count}</strong> mat. ({tier.percent}%)
              </span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${tier.fillClass}`}
                style={{ width: `${tier.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {notaMaxima > 0 && (
        <div className={styles.highNoteFooter}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={16} color="#eab308" />
            <span>
              Nota más alta: <strong>{materiaNotaMaxima || 'Asignatura destacada'}</strong>
            </span>
          </div>
          <span className={styles.highNoteValue}>{notaMaxima}</span>
        </div>
      )}
    </div>
  );
};
