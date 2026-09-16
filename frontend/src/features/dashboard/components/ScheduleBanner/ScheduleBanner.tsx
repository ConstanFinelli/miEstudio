import React from 'react';
import styles from './ScheduleBanner.module.css';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { useEvaluaciones } from '../../../../hooks';

interface ScheduleBannerProps {
  onGoToCalendario: () => void;
}

export const ScheduleBanner: React.FC<ScheduleBannerProps> = ({ onGoToCalendario }) => {
  const { proximas } = useEvaluaciones();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const pendingCount = proximas.filter(ev => {
    if (ev.nota !== null && ev.nota !== undefined) return false;
    if (!ev.fecha) return false;
    return new Date(ev.fecha).getTime() >= todayStart;
  }).length;

  const label = pendingCount > 0
    ? `Ver cronograma completo de exámenes (${pendingCount} ${pendingCount === 1 ? 'evento próximo' : 'eventos próximos'})`
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
