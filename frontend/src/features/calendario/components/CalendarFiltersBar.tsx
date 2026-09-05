import React from 'react';
import styles from '../CalendarioView.module.css';

interface CalendarFiltersBarProps {
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const CalendarFiltersBar: React.FC<CalendarFiltersBarProps> = ({
  selectedFilter,
  onSelectFilter
}) => {
  return (
    <div className={styles.filtersRow}>
      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>FILTRAR:</span>
      <div
        className={styles.filterItem}
        style={{
          opacity: selectedFilter === 'ALL' ? 1 : 0.6,
          fontWeight: selectedFilter === 'ALL' ? 700 : 400
        }}
        onClick={() => onSelectFilter('ALL')}
      >
        <span>Todos</span>
      </div>
      <div
        className={styles.filterItem}
        style={{
          opacity: selectedFilter === 'ALL' || selectedFilter === 'EXAMEN' ? 1 : 0.4,
          fontWeight: selectedFilter === 'EXAMEN' ? 700 : 400
        }}
        onClick={() => onSelectFilter(selectedFilter === 'EXAMEN' ? 'ALL' : 'EXAMEN')}
      >
        <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--red)' }} />
        <span>Exámenes Parciales y Finales</span>
      </div>
      <div
        className={styles.filterItem}
        style={{
          opacity: selectedFilter === 'ALL' || selectedFilter === 'TP' ? 1 : 0.4,
          fontWeight: selectedFilter === 'TP' ? 700 : 400
        }}
        onClick={() => onSelectFilter(selectedFilter === 'TP' ? 'ALL' : 'TP')}
      >
        <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--purple)' }} />
        <span>Trabajos Prácticos y Entregas</span>
      </div>
      <div
        className={styles.filterItem}
        style={{
          opacity: selectedFilter === 'ALL' || selectedFilter === 'LAB' ? 1 : 0.4,
          fontWeight: selectedFilter === 'LAB' ? 700 : 400
        }}
        onClick={() => onSelectFilter(selectedFilter === 'LAB' ? 'ALL' : 'LAB')}
      >
        <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--blue)' }} />
        <span>Laboratorios</span>
      </div>
      <div
        className={styles.filterItem}
        style={{
          opacity: selectedFilter === 'ALL' || selectedFilter === 'ESTUDIO' ? 1 : 0.4,
          fontWeight: selectedFilter === 'ESTUDIO' ? 700 : 400
        }}
        onClick={() => onSelectFilter(selectedFilter === 'ESTUDIO' ? 'ALL' : 'ESTUDIO')}
      >
        <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--emerald)' }} />
        <span>Sesiones de Estudio / Clases</span>
      </div>
    </div>
  );
};

export default CalendarFiltersBar;
