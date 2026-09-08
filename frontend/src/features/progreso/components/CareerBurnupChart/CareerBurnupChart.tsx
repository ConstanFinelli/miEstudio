import React, { useState } from 'react';
import styles from './CareerBurnupChart.module.css';
import type { AnioEstadistica } from '../../hooks/useProgresoAcademico';

interface CareerBurnupChartProps {
  evolucionPorAnio: AnioEstadistica[];
  totalPlan: number;
}

export const CareerBurnupChart: React.FC<CareerBurnupChartProps> = ({
  evolucionPorAnio,
  totalPlan
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (evolucionPorAnio.length === 0) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitleGroup}>
            <span className={styles.chartLabel}>Ritmo de Avance y Curva Acumulada</span>
            <span className={styles.chartSub}>Materias aprobadas por año vs. total del plan</span>
          </div>
        </div>
        <div className={styles.emptyState}>
          Aún no registraste materias aprobadas o promocionadas. A medida que acredites cursadas, aquí verás tu velocidad anual de avance.
        </div>
      </div>
    );
  }

  // Geometry calculations
  const totalItems = evolucionPorAnio.length;
  const maxYearCount = Math.max(1, ...evolucionPorAnio.map(e => e.count));
  const maxAcumulado = Math.max(totalPlan, ...evolucionPorAnio.map(e => e.acumulado));
  const svgWidth = 600;
  const svgHeight = 170;
  const leftPad = 45;
  const rightPad = 35;
  const topPad = 25;
  const bottomAxisY = 140;
  const chartHeight = bottomAxisY - topPad;
  const chartWidth = svgWidth - leftPad - rightPad;

  const getX = (index: number) => {
    if (totalItems === 1) return leftPad + chartWidth / 2;
    return leftPad + (index / (totalItems - 1)) * chartWidth;
  };

  const getCumulativeY = (val: number) => {
    return bottomAxisY - (val / maxAcumulado) * chartHeight;
  };

  const barWidth = Math.max(18, Math.min(36, (chartWidth / totalItems) * 0.45));

  // Line points
  const points = evolucionPorAnio.map((item, idx) => ({
    x: getX(idx),
    y: getCumulativeY(item.acumulado),
    item,
    idx
  }));

  const linePathD = points.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
    ''
  );

  const targetLineY = getCumulativeY(totalPlan);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitleGroup}>
          <span className={styles.chartLabel}>Ritmo de Avance y Curva Acumulada</span>
          <span className={styles.chartSub}>
            Materias aprobadas por año lectivo vs. meta total del plan ({totalPlan} materias)
          </span>
        </div>

        <div className={styles.legendRow}>
          <div className={styles.legendItem}>
            <span className={styles.legendDotBar} />
            <span>Aprobadas en el año</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDotLine} />
            <span>Curva acumulada</span>
          </div>
        </div>
      </div>

      <div className={styles.chartSvgContainer}>
        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-glow)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={leftPad}
            y1={bottomAxisY}
            x2={svgWidth - rightPad}
            y2={bottomAxisY}
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />

          {/* Target plan dashed line */}
          {targetLineY >= topPad && (
            <g>
              <line
                x1={leftPad}
                y1={targetLineY}
                x2={svgWidth - rightPad}
                y2={targetLineY}
                stroke="var(--emerald)"
                strokeDasharray="4 4"
                strokeWidth="1.2"
                opacity="0.6"
              />
              <text
                x={svgWidth - rightPad}
                y={targetLineY - 4}
                textAnchor="end"
                fill="var(--emerald)"
                fontSize="9"
                fontFamily="var(--font-mono)"
                opacity="0.8"
              >
                Meta: {totalPlan} materias
              </text>
            </g>
          )}

          {/* Annual Bars */}
          {evolucionPorAnio.map((item, idx) => {
            const x = getX(idx);
            const barH = (item.count / maxYearCount) * (chartHeight * 0.7);
            const barY = bottomAxisY - barH;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={item.anio}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={barH}
                  rx="3"
                  fill={isHovered ? 'url(#barGradientHover)' : 'url(#barGradient)'}
                />
                {/* Value above bar */}
                <text
                  x={x}
                  y={barY - 4}
                  textAnchor="middle"
                  fill={isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  +{item.count}
                </text>

                {/* Year label under axis */}
                <text
                  x={x}
                  y={bottomAxisY + 16}
                  textAnchor="middle"
                  fill={isHovered ? 'var(--primary-glow)' : 'var(--text-dim)'}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight={isHovered ? '600' : 'normal'}
                >
                  {item.anio}
                </text>
              </g>
            );
          })}

          {/* Cumulative Line */}
          <path
            d={linePathD}
            fill="none"
            stroke="var(--emerald)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cumulative dots */}
          {points.map((p) => {
            const isHovered = hoveredIdx === p.idx;
            return (
              <g key={p.idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5.5 : 4}
                  fill="var(--surface-1)"
                  stroke="var(--emerald)"
                  strokeWidth={isHovered ? 2.5 : 2}
                />
                <text
                  x={p.x + (p.idx === totalItems - 1 ? -8 : 8)}
                  y={p.y - 7}
                  textAnchor={p.idx === totalItems - 1 ? 'end' : 'start'}
                  fill="var(--emerald)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  {p.item.acumulado}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Year breakdown cards below */}
      <div className={styles.yearDetailsRow}>
        {evolucionPorAnio.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={item.anio}
              className={styles.yearPillCard}
              style={{
                borderColor: isHovered ? 'var(--primary)' : 'var(--border-subtle)',
                backgroundColor: isHovered ? 'var(--surface-3)' : 'var(--surface-2)'
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className={styles.yearPillHeader}>
                <span>{item.anio}</span>
                <span className={styles.yearPillCount}>+{item.count} mat.</span>
              </div>
              <span className={styles.yearPillSub}>
                Prom: {item.promedio.toFixed(2)} · Acum: {item.acumulado}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
