import React from 'react';
import styles from '../DashboardView.module.css';
import { TrendingUp } from 'lucide-react';
import { usePerfil } from '../../../hooks';

export const AcademicProgressChart: React.FC = () => {
  const { perfil } = usePerfil();
  const historico = perfil?.promedioHistorico || [];

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
        {historico.length > 1 && (
          <div className={styles.chartTrend}>
            <TrendingUp size={14} />
            <span>Tendencia académica</span>
          </div>
        )}
      </div>

      {historico.length === 0 ? (
        <div style={{
          padding: '24px 16px',
          textAlign: 'center',
          backgroundColor: 'var(--surface-1)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border-subtle)',
          margin: '12px 0'
        }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>
            Curva en espera de calificaciones
          </p>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', maxWidth: '420px', display: 'inline-block', lineHeight: 1.4 }}>
            A medida que registres parciales y finales aprobados, se graficará automáticamente tu evolución cuatrimestral.
          </span>
        </div>
      ) : (
        <>
          <div className={styles.chartSvgWrapper}>
            <svg width="100%" height="100%" viewBox="0 0 500 70" preserveAspectRatio="none">
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {(() => {
                const points = historico.map((item, idx) => {
                  const x = 30 + (idx / Math.max(1, historico.length - 1)) * 440;
                  // Map average 0..10 to svg y: 10 -> y=12, 4 -> y=58
                  const y = Math.max(12, Math.min(58, 65 - ((item.promedio - 4) / 6) * 48));
                  return { x, y, item };
                });
                const d = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                const areaD = `${d} L ${points[points.length - 1].x} 70 L ${points[0].x} 70 Z`;
                return (
                  <>
                    <path d={areaD} fill="url(#curveGrad)" />
                    <path d={d} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r={idx === points.length - 1 ? 4.5 : 3.5}
                        fill={idx === points.length - 1 ? 'var(--surface-1)' : 'var(--primary-glow)'}
                        stroke="var(--primary)"
                        strokeWidth={idx === points.length - 1 ? 2 : 1}
                      />
                    ))}
                  </>
                );
              })()}
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
                  {item.cuatrimestre} ({item.promedio.toFixed(1)})
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AcademicProgressChart;
