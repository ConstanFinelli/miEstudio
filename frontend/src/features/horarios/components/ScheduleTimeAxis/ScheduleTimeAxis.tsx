import React from 'react';
import styles from './ScheduleTimeAxis.module.css';

interface ScheduleTimeAxisProps {
  hourMarks: number[];
  minHour: number;
  maxHour: number;
}

export const ScheduleTimeAxis: React.FC<ScheduleTimeAxisProps> = ({
  hourMarks,
  minHour,
  maxHour
}) => {
  return (
    <div className={styles.timeAxis}>
      {hourMarks.map((h) => {
        const topPct = ((h - minHour) / (maxHour - minHour)) * 100;
        return (
          <span
            key={h}
            className={styles.timeLabel}
            style={{ top: `${topPct}%` }}
          >
            {String(h).padStart(2, '0')}:00
          </span>
        );
      })}
    </div>
  );
};

export default ScheduleTimeAxis;
