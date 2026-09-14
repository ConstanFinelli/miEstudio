import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardView.module.css';
import {
  DashboardWelcomeBar,
  DashboardKpis,
  UpcomingEvaluations,
  ScheduleBanner,
  RecentNotesWidget
} from './components';

interface DashboardViewProps {
  onNavigate?: (view: 'dashboard' | 'materias' | 'calendario' | 'apuntes' | 'horarios') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate
}) => {
  const navigate = useNavigate();
  const goTo = (view: string, query?: string) => {
    if (onNavigate) onNavigate(view as any);
    navigate('/' + view + (query ? `?${query}` : ''));
  };

  return (
    <div className={styles.container}>
      {/* 1. Header / Welcome Banner */}
      <DashboardWelcomeBar />

      {/* 2. Academic KPIs Grid */}
      <DashboardKpis
        onGoToMaterias={(materiaId) =>
          goTo('materias', materiaId ? `materiaId=${encodeURIComponent(materiaId)}` : undefined)
        }
        onGoToCalendario={() => goTo('calendario')}
        onGoToHorarios={() => goTo('horarios')}
      />

      {/* 3. Main 2-Column Split */}
      <div className={styles.dashboardSplit}>
        {/* Left Column: Próximas Evaluaciones + Calendario Banner */}
        <div className={styles.leftColumn}>
          <UpcomingEvaluations
            onGoToMaterias={(materiaId) =>
              goTo('materias', materiaId ? `materiaId=${encodeURIComponent(materiaId)}` : undefined)
            }
            onGoToApuntes={() => goTo('apuntes')}
          />

          <ScheduleBanner onGoToCalendario={() => goTo('calendario')} />
        </div>

        {/* Right Column: Notas Recientes */}
        <div className={styles.rightColumn}>
          <RecentNotesWidget onGoToApuntes={() => goTo('apuntes')} />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
