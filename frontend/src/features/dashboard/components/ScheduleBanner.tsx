import React from 'react';
import styles from '../DashboardView.module.css';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { useEvaluaciones } from '../../../hooks';

interface ScheduleBannerProps {
  onGoToCalendario: () => void;
}

export const ScheduleBanner: React.FC<ScheduleBannerProps> = ({ onGoToCalendario }) => {
  const { proximas } = useEvaluaciones();

  const label = proximas.length > 0
    ? `Ver cronograma completo de exámenes (${proximas.length} ${proximas.length === 1 ? 'evento pendiente' : 'eventos pendientes'})`
    : 'Ver calendario académico y cronograma de cursadas';

  return (
    <div className={styles.scheduleBanner} onClick={onGoToCalendario}>
      <div className={styles.scheduleBannerLeft}>
        <CalendarClock size={16} color="var(--primary-glow)" />
        <span>{label}</span>
      </div>
      <span style={{ fontSize: '12px', color: 'var(--primary-glow)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        Ver calendario <ArrowRight size={13} />
      </span>
    </div>
  );
};

export default ScheduleBanner;
