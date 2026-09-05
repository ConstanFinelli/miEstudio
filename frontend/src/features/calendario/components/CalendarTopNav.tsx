import React from 'react';
import styles from '../CalendarioView.module.css';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarTopNavProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  viewMode: 'mes' | 'semana' | 'agenda';
  onViewModeChange: (mode: 'mes' | 'semana' | 'agenda') => void;
  onOpenEvaluationModal: () => void;
}

export const CalendarTopNav: React.FC<CalendarTopNavProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  viewMode,
  onViewModeChange,
  onOpenEvaluationModal
}) => {
  const monthName = currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  const formattedMonthTitle = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  const todayLabel = `HOY · ${new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).toUpperCase()}`;

  return (
    <div className={styles.topNav}>
      <div className={styles.monthControls}>
        <button className={styles.arrowBtn} onClick={onPrevMonth} title="Mes anterior">
          <ChevronLeft size={14} />
        </button>
        <h2 className={styles.monthTitle}>{formattedMonthTitle}</h2>
        <button className={styles.arrowBtn} onClick={onNextMonth} title="Mes siguiente">
          <ChevronRight size={14} />
        </button>
        <button className={styles.todayBtn} onClick={onToday}>
          {todayLabel}
        </button>
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
          <span>+ Nueva Fecha / Examen</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarTopNav;
