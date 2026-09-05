import React from 'react';
import styles from '../DashboardView.module.css';
import { BookOpen, ExternalLink } from 'lucide-react';

interface RecentNotesWidgetProps {
  onGoToApuntes: () => void;
}

export const RecentNotesWidget: React.FC<RecentNotesWidgetProps> = ({ onGoToApuntes }) => {
  return (
    <div className={styles.widgetCard}>
      <div className={styles.widgetHeader}>
        <div className={styles.widgetTitle}>
          <BookOpen size={13} />
          <span>NOTAS RECIENTES</span>
        </div>
        <button
          style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={onGoToApuntes}
        >
          <span>Ver todas</span>
          <ExternalLink size={11} />
        </button>
      </div>

      <div className={styles.recentNotesList}>
        <div className={styles.recentNoteItem} onClick={onGoToApuntes}>
          <div className={styles.recentNoteMeta}>
            <span className={styles.recentNoteSubject}>SISTEMAS DISTRIBUIDOS</span>
            <span className={styles.recentNoteDate}>Editado hace 2h</span>
          </div>
          <div className={styles.recentNoteTitle}>Glosario: Sharding, Replicación y Teorema CAP</div>
          <div className={styles.recentNoteExcerpt}>
            Diferencias prácticas entre consistencia secuencial, causal y eventual...
          </div>
        </div>

        <div className={styles.recentNoteItem} onClick={onGoToApuntes}>
          <div className={styles.recentNoteMeta}>
            <span className={styles.recentNoteSubject} style={{ color: 'var(--blue)' }}>BASES DE DATOS II</span>
            <span className={styles.recentNoteDate}>Ayer, 21:30</span>
          </div>
          <div className={styles.recentNoteTitle}>Árboles B+ y Optimización de Consultas SQL</div>
          <div className={styles.recentNoteExcerpt}>
            Análisis de planes con EXPLAIN ANALYZE. Costos de I/O y buffer pool...
          </div>
        </div>

        <div className={styles.recentNoteItem} onClick={onGoToApuntes}>
          <div className={styles.recentNoteMeta}>
            <span className={styles.recentNoteSubject} style={{ color: 'var(--purple)' }}>REDES DE DATOS</span>
            <span className={styles.recentNoteDate}>18 Abr</span>
          </div>
          <div className={styles.recentNoteTitle}>Control de Congestión en TCP: Tahoe vs Reno vs BBR</div>
          <div className={styles.recentNoteExcerpt}>
            Ventanas de congestión (cwnd), Slow Start y mecanismos de retransmisión...
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentNotesWidget;
