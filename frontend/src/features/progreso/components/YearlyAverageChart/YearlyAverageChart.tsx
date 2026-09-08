import React, { useState } from 'react';
import styles from './YearlyAverageChart.module.css';
import type { AnioEstadistica } from '../../hooks/useProgresoAcademico';

interface YearlyAverageChartProps {
  evolucionPorAnio: AnioEstadistica[];
  promedioGeneral: number;
}

export const YearlyAverageChart: React.FC<YearlyAverageChartProps> = ({
  evolucionPorAnio,
  promedioGeneral
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (evolucionPorAnio.length === 0) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitleGroup}>
            <span className={styles.chartLabel}>Rendimiento Anual</span>
            <span className={styles.chartSub}>Curva de notas promedio por año lectivo</span>
          </div>
        </div>
        <div className={styles.emptyState}>
          Registra notas finales o materias promocionadas para visualizar la evolución histórica de tu promedio.
        </div>
      </div>
    );
  }

  const totalItems = evolucionPorAnio.length;
  const svgWidth = 600;
  const svgHeight = 170;
  const leftPad = 45;
  const rightPad = 35;
  const topPad = 25;
  const bottomAxisY = 140;
  const chartHeight = bottomAxisY - topPad;
  const chartWidth = svgWidth - leftPad - rightPad;

  // Grade range from 4.0 to 10.0
  const minGrade = 4.0;
  const maxGrade = 10.0;

  const getX = (index: number) => {
    if (totalItems === 1) return leftPad + chartWidth / 2;
    return leftPad + (index / (totalItems - 1)) * chartWidth;
  };

  const getY = (grade: number) => {
    const clamped = Math.max(minGrade, Math.min(maxGrade, grade));
    const ratio = (clamped - minGrade) / (maxGrade - minGrade);
    return bottomAxisY - ratio * chartHeight;
  };

  const points = evolucionPorAnio.map((item, idx) => ({
    x: getX(idx),
    y: getY(item.promedio),
    item,
    idx
  }));

  const linePathD = points.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
    ''
  );

  const areaD =
    totalItems > 1
      ? `${linePathD} L ${points[points.length - 1].x} ${bottomAxisY} L ${points[0].x} ${bottomAxisY} Z`
      : '';

  const promoLineY = getY(8.0);
  const minPassLineY = getY(4.0);

  // Best year
  const bestYear = [...evolucionPorAnio].sort((a, b) => b.promedio - a.promedio)[0];

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitleGroup}>
          <span className={styles.chartLabel}>Evolución del Promedio Anual</span>
          <span className={styles.chartSub}>
            Rendimiento obtenido en cada ciclo lectivo acreditado
          </span>
        </div>

        <div className={styles.legendRow}>
          <div className={styles.legendItem}>
            <span className={styles.legendDotCurve} />
            <span>Promedio anual</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDotPromo} />
            <span>Corte Promoción (8.0)</span>
          </div>
        </div>
      </div>

      <div className={styles.chartSvgContainer}>
        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="yearlyAvgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference line: Aprobacion 4.0 */}
          <line
            x1={leftPad}
            y1={minPassLineY}
            x2={svgWidth - rightPad}
            y2={minPassLineY}
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
          <text
            x={leftPad - 8}
            y={minPassLineY + 3}
            textAnchor="end"
            fill="var(--text-dim)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            4.0
          </text>

          {/* Reference line: Promocion 8.0 */}
          <line
            x1={leftPad}
            y1={promoLineY}
            x2={svgWidth - rightPad}
            y2={promoLineY}
            stroke="var(--amber)"
            strokeDasharray="4 4"
            strokeWidth="1.2"
            opacity="0.5"
          />
          <text
            x={leftPad - 8}
            y={promoLineY + 3}
            textAnchor="end"
            fill="var(--amber)"
            fontSize="9"
            fontFamily="var(--font-mono)"
            opacity="0.8"
          >
            8.0
          </text>

          {/* Top line: 10.0 */}
          <line
            x1={leftPad}
            y1={topPad}
            x2={svgWidth - rightPad}
            y2={topPad}
            stroke="var(--border-subtle)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
          <text
            x={leftPad - 8}
            y={topPad + 3}
            textAnchor="end"
            fill="var(--text-dim)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            10.0
          </text>

          {/* Area gradient under line */}
          {areaD && <path d={areaD} fill="url(#yearlyAvgGrad)" />}

          {/* Main curve */}
          <path
            d={linePathD}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Interactive Tooltips */}
          {points.map((p) => {
            const isHovered = hoveredIdx === p.idx;
            const prev = p.idx > 0 ? points[p.idx - 1] : null;
            const delta = prev ? p.item.promedio - prev.item.promedio : null;

            return (
              <g
                key={p.idx}
                onMouseEnter={() => setHoveredIdx(p.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Vertical guide on hover */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={topPad}
                    x2={p.x}
                    y2={bottomAxisY}
                    stroke="var(--border-hover)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                )}

                {/* Outer halo */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill="var(--surface-1)"
                  stroke="var(--primary)"
                  strokeWidth={isHovered ? 2.5 : 2}
                />

                {/* Score label */}
                <text
                  x={p.x}
                  y={p.y - 9}
                  textAnchor="middle"
                  fill={isHovered ? 'var(--primary-glow)' : 'var(--text-primary)'}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  {p.item.promedio.toFixed(2)}
                </text>

                {/* Delta indicator if improved */}
                {delta !== null && isHovered && (
                  <text
                    x={p.x}
                    y={p.y - 21}
                    textAnchor="middle"
                    fill={delta >= 0 ? 'var(--emerald)' : 'var(--amber)'}
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fontWeight="600"
                  >
                    {delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                  </text>
                )}

                {/* Year label */}
                <text
                  x={p.x}
                  y={bottomAxisY + 16}
                  textAnchor="middle"
                  fill={isHovered ? 'var(--primary-glow)' : 'var(--text-dim)'}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight={isHovered ? '600' : 'normal'}
                >
                  {p.item.anio}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.statsFooter}>
        <div className={styles.footerStat}>
          <span>Promedio Histórico Global:</span>
          <span className={styles.footerStatVal}>
            {promedioGeneral > 0 ? promedioGeneral.toFixed(2) : '---'}
          </span>
        </div>
        {bestYear && (
          <div className={styles.footerStat}>
            <span>Mejor Año Académico:</span>
            <span className={styles.footerStatVal} style={{ color: 'var(--emerald)' }}>
              {bestYear.anio} ({bestYear.promedio.toFixed(2)})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
