import React from 'react';
import styles from './ScheduleDayColumn.module.css';
import type { HorarioCursada, DiaSemana } from '../../../../types/academic';
import { ScheduleCard, type ScheduleLayoutItem } from '../ScheduleCard';

interface ScheduleDayColumnProps {
  day: { id: DiaSemana; label: string; short: string; dayIndex: number };
  isToday: boolean;
  items: ScheduleLayoutItem[];
  hourMarks: number[];
  minHour: number;
  maxHour: number;
  onOpenAddModal: (dia: DiaSemana) => void;
  onCardClick: (horario: HorarioCursada) => void;
  onCardDelete: (e: React.MouseEvent, id: string, name?: string) => void;
  onCardColorClick?: (
    materiaId: string,
    materiaNombre: string,
    currentColor?: string,
    materiaCodigo?: string,
  ) => void;
}

export const ScheduleDayColumn: React.FC<ScheduleDayColumnProps> = ({
  day,
  isToday,
  items,
  hourMarks,
  minHour,
  maxHour,
  onOpenAddModal,
  onCardClick,
  onCardDelete,
  onCardColorClick,
}) => {
  return (
    <div
      className={`${styles.dayColumn} ${isToday ? styles.dayColumnToday : ''}`}
      onDoubleClick={() => onOpenAddModal(day.id)}
      title={`Doble clic para agregar clase el ${day.label}`}
    >
      {/* Horizontal Hour Reference Lines */}
      {hourMarks.map((h) => {
        const topPct = ((h - minHour) / (maxHour - minHour)) * 100;
        return (
          <div
            key={h}
            className={styles.hourLine}
            style={{ top: `${topPct}%` }}
          />
        );
      })}

      {/* Class Block Cards */}
      {items.map((item) => (
        <ScheduleCard
          key={item.horario.id}
          item={item}
          onClick={onCardClick}
          onDelete={onCardDelete}
          onColorClick={onCardColorClick}
        />
      ))}
    </div>
  );
};

export default ScheduleDayColumn;
