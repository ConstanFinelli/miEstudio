import React from 'react';
import styles from './ScheduleGridHeader.module.css';
import type { DiaSemana } from '../../../../types/academic';

interface DayHeaderItem {
  id: DiaSemana;
  label: string;
  short: string;
  dayIndex: number;
}

interface ScheduleGridHeaderProps {
  activeDays: DayHeaderItem[];
  currentDayIndex: number;
}

export const ScheduleGridHeader: React.FC<ScheduleGridHeaderProps> = ({
  activeDays,
  currentDayIndex
}) => {
  return (
    <div
      className={styles.gridHeader}
      style={{
        gridTemplateColumns: `60px repeat(${activeDays.length}, 1fr)`
      }}
    >
      <div className={styles.timeColHeader}>HORA</div>
      {activeDays.map((d) => {
        const isToday = d.dayIndex === currentDayIndex;
        return (
          <div
            key={d.id}
            className={`${styles.dayColHeader} ${isToday ? styles.dayColHeaderToday : ''}`}
          >
            {d.label.toUpperCase()} {isToday ? '· HOY' : ''}
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleGridHeader;
