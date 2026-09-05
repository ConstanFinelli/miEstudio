import React from 'react';
import styles from '../DashboardView.module.css';
import { CalendarClock, ArrowRight } from 'lucide-react';

interface ScheduleBannerProps {
  onGoToCalendario: () => void;
}

export const ScheduleBanner: React.FC<ScheduleBannerProps> = ({ onGoToCalendario }) => {
  return (
    <div className={styles.scheduleBanner} onClick={onGoToCalendario}>
      <div className={styles.scheduleBannerLeft}>
        <CalendarClock size={16} color="var(--primary-glow)" />
        <span>Ver cronograma completo de exámenes del cuatrimestre (12 eventos restantes)</span>
      </div>
      <span style={{ fontSize: '12px', color: 'var(--primary-glow)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        Ver calendario completo <ArrowRight size={13} />
      </span>
    </div>
  );
};

export default ScheduleBanner;
