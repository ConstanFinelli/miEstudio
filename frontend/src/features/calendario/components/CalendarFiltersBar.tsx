import React from 'react';
import styles from '../CalendarioView.module.css';

export const CalendarFiltersBar: React.FC = () => {
  return (
    <div className={styles.filtersRow}>
      <span>FILTRAR:</span>
      <div className={styles.filterItem}>
        <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--red)' }} />
        <span>Exámenes Parciales y Finales</span>
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--purple)' }} />
        <span>Trabajos Prácticos y Entregas</span>
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--blue)' }} />
        <span>Laboratorios</span>
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--emerald)' }} />
        <span>Sesiones de Estudio / Recordatorios</span>
      </div>
    </div>
  );
};

export default CalendarFiltersBar;
