import React from 'react';
import styles from './ScheduleEmptyState.module.css';
import { Calendar, Clock, Plus } from 'lucide-react';

interface ScheduleEmptyStateProps {
  hasNoSchedules: boolean;
  onOpenAddModal: () => void;
}

export const ScheduleEmptyState: React.FC<ScheduleEmptyStateProps> = ({
  hasNoSchedules,
  onOpenAddModal
}) => {
  if (hasNoSchedules) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconCircle}>
          <Calendar size={28} />
        </div>
        <h3 className={styles.emptyTitle}>Sin Horarios de Cursada Configurados</h3>
        <p className={styles.emptyDesc}>
          Armá tu cronograma semanal de clases con total flexibilidad de bandas horarias, sedes universitarias y modalidades.
        </p>
        <button className={styles.btnAddHorario} onClick={onOpenAddModal}>
          <Plus size={14} />
          <span>Configurar Primer Horario</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIconCircle}>
        <Clock size={28} />
      </div>
      <h3 className={styles.emptyTitle}>Sin materias activas en cursada</h3>
      <p className={styles.emptyDesc}>
        El cronograma semanal se forma únicamente con materias con estado <strong>Cursando</strong>.
      </p>
    </div>
  );
};

export default ScheduleEmptyState;
