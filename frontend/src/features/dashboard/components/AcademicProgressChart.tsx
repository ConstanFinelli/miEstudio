import React from 'react';
import styles from '../DashboardView.module.css';
import { TrendingUp } from 'lucide-react';
import { usePerfil } from '../../../hooks';

export const AcademicProgressChart: React.FC = () => {
  const { perfil } = usePerfil();

  const historico = perfil?.promedioHistorico || [
    { cuatrimestre: '2022-1C', promedio: 7.2 },
    { cuatrimestre: '2022-2C', promedio: 7.6 },
    { cuatrimestre: '2023-1C', promedio: 7.9 },
    { cuatrimestre: '2024-1C', promedio: 8.1 },
    { cuatrimestre: '2025-1C', promedio: 8.42 }
  ];

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            EVOLUCIÓN DE PROMEDIO PONDERADO
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Curva histórica de calificaciones por cuatrimestre
          </div>
        </div>
        <div className={styles.chartTrend}>
          <TrendingUp size={14} />
          <span>Tendencia positiva</span>
        </div>
      </div>

      <div className={styles.chartSvgWrapper}>
        <svg width="100%" height="100%" viewBox="0 0 500 70" preserveAspectRatio="none">
          <defs>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 20 55 Q 120 48, 200 40 T 350 25 T 480 15 L 480 70 L 20 70 Z"
            fill="url(#curveGrad)"
          />
          <path
            d="M 20 55 Q 120 48, 200 40 T 350 25 T 480 15"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="20" cy="55" r="3.5" fill="var(--primary-glow)" />
          <circle cx="135" cy="46" r="3.5" fill="var(--primary-glow)" />
          <circle cx="250" cy="35" r="3.5" fill="var(--primary-glow)" />
          <circle cx="365" cy="24" r="3.5" fill="var(--primary-glow)" />
          <circle cx="480" cy="15" r="4.5" fill="var(--surface-1)" stroke="var(--primary)" strokeWidth="2" />
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
        {historico.map((item, idx) => {
          const isLatest = idx === historico.length - 1;
          return (
            <span
              key={item.cuatrimestre}
              style={{ color: isLatest ? 'var(--emerald)' : undefined, fontWeight: isLatest ? '600' : undefined }}
            >
              {item.cuatrimestre} ({item.promedio})
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default AcademicProgressChart;
