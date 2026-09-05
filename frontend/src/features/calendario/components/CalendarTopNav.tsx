import React from 'react';
import styles from '../CalendarioView.module.css';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarTopNavProps {
  viewMode: 'mes' | 'semana' | 'agenda';
  onViewModeChange: (mode: 'mes' | 'semana' | 'agenda') => void;
  onOpenEvaluationModal: () => void;
}

export const CalendarTopNav: React.FC<CalendarTopNavProps> = ({
  viewMode,
  onViewModeChange,
  onOpenEvaluationModal
}) => {
  return (
    <div className={styles.topNav}>
      <div className={styles.monthControls}>
        <button className={styles.arrowBtn}>
          <ChevronLeft size={14} />
        </button>
        <h2 className={styles.monthTitle}>Abril 2025</h2>
        <button className={styles.arrowBtn}>
          <ChevronRight size={14} />
        </button>
        <button className={styles.todayBtn}>HOY · 21 ABR</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className={styles.viewModeGroup}>
          {(['mes', 'semana', 'agenda'] as const).map(mode => (
            <button
              key={mode}
              className={`${styles.viewBtn} ${viewMode === mode ? styles.viewBtnActive : ''}`}
              onClick={() => onViewModeChange(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        <button className={styles.btnNewEvent} onClick={onOpenEvaluationModal}>
          <Plus size={14} />
          <span>+ Nuevo Evento de Estudio (E)</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarTopNav;
