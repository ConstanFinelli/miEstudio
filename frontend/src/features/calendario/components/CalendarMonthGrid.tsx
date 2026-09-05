import React, { useMemo } from 'react';
import styles from '../CalendarioView.module.css';
import type { EventoCalendario } from '../../../types/academic';

interface CalendarMonthGridProps {
  currentDate: Date;
  events: EventoCalendario[];
  selectedEventId: string | null;
  onSelectEventId: (id: string) => void;
  selectedDateStr?: string | null;
  onSelectDate?: (dateStr: string) => void;
}

export const CalendarMonthGrid: React.FC<CalendarMonthGridProps> = ({
  currentDate,
  events,
  selectedEventId,
  onSelectEventId,
  selectedDateStr,
  onSelectDate
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Compute month cells (Monday first)
  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      dayNum: number;
      dateStr: string;
      isOutside: boolean;
      isToday: boolean;
      dayEvents: EventoCalendario[];
    }> = [];

    // 1. Previous month overflow days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayNum).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      cells.push({
        dayNum,
        dateStr,
        isOutside: true,
        isToday: dateStr === todayStr,
        dayEvents: events.filter(e => e.fecha === dateStr)
      });
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const m = String(month + 1).padStart(2, '0');
      const d = String(dayNum).padStart(2, '0');
      const dateStr = `${year}-${m}-${d}`;

      cells.push({
        dayNum,
        dateStr,
        isOutside: false,
        isToday: dateStr === todayStr,
        dayEvents: events.filter(e => e.fecha === dateStr)
      });
    }

    // 3. Next month overflow days (fill grid to 35 or 42 cells)
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextDate = new Date(year, month + 1, dayNum);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayNum).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      cells.push({
        dayNum,
        dateStr,
        isOutside: true,
        isToday: dateStr === todayStr,
        dayEvents: events.filter(e => e.fecha === dateStr)
      });
    }

    return cells;
  }, [year, month, events, todayStr]);

  const getBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'EXAMEN':
      case 'PARCIAL':
      case 'FINAL':
        return styles.eventBadgeExam;
      case 'ENTREGA':
      case 'TP':
        return styles.eventBadgeTP;
      case 'LAB':
      case 'LABORATORIO':
        return styles.eventBadgeLab;
      case 'ESTUDIO':
      case 'CONSULTA':
      default:
        return styles.eventBadgeStudy;
    }
  };

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case 'EXAMEN':
      case 'PARCIAL':
      case 'FINAL':
        return '★';
      case 'ENTREGA':
      case 'TP':
        return '📦';
      case 'LAB':
      case 'LABORATORIO':
        return '🔬';
      case 'ESTUDIO':
      case 'CONSULTA':
      default:
        return '📖';
    }
  };

  return (
    <div className={styles.gridWrapper}>
      <div className={styles.daysHeaderRow}>
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
          <div key={d} className={styles.dayColHeader}>{d}</div>
        ))}
      </div>

      <div className={styles.cellsGrid}>
        {calendarCells.map((cell) => {
          const hasSelectedEvent = cell.dayEvents.some(e => e.id === selectedEventId);
          const isDateSelected = selectedDateStr === cell.dateStr;
          const isSelected = hasSelectedEvent || isDateSelected;

          return (
            <div
              key={cell.dateStr}
              className={`${styles.dayCell} ${cell.isOutside ? styles.dayCellOutside : ''} ${isSelected ? styles.dayCellSelected : ''}`}
              onClick={() => {
                if (cell.dayEvents.length > 0) {
                  onSelectEventId(cell.dayEvents[0].id);
                } else if (onSelectDate) {
                  onSelectDate(cell.dateStr);
                }
              }}
            >
              <div className={styles.dayCellHeader}>
                {cell.isToday ? (
                  <span className={styles.dayCellToday}>{cell.dayNum} HOY</span>
                ) : (
                  <span>{String(cell.dayNum).padStart(2, '0')}</span>
                )}
                {cell.dayEvents.length > 0 && (
                  <span style={{ fontSize: '9px', color: 'var(--primary-glow)' }}>
                    ●
                  </span>
                )}
              </div>

              {cell.dayEvents.slice(0, 2).map((ev) => (
                <div
                  key={ev.id}
                  className={getBadgeClass(ev.tipo)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEventId(ev.id);
                  }}
                  title={`${ev.titulo} (${ev.horarioInicio || ''})`}
                >
                  <span>{getEventIcon(ev.tipo)}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.titulo}
                  </span>
                </div>
              ))}

              {cell.dayEvents.length > 2 && (
                <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  +{cell.dayEvents.length - 2} más
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonthGrid;
