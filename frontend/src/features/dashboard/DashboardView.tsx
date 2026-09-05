import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardView.module.css';
import {
  DashboardWelcomeBar,
  DashboardKpis,
  UpcomingEvaluations,
  ScheduleBanner,
  AcademicProgressChart,
  PomodoroWidget,
  RecentNotesWidget,
  KeyboardShortcutsWidget
} from './components';

interface DashboardViewProps {
  onNavigate?: (view: 'dashboard' | 'materias' | 'calendario' | 'apuntes') => void;
  onOpenEvaluationModal: () => void;
  onOpenNoteModal: () => void;
  onStartPomodoro: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenEvaluationModal,
  onOpenNoteModal,
  onStartPomodoro
}) => {
  const navigate = useNavigate();
  const goTo = (view: string) => {
    if (onNavigate) onNavigate(view as any);
    navigate('/' + view);
  };

  return (
    <div className={styles.container}>
      {/* 1. Header / Welcome Banner */}
      <DashboardWelcomeBar />

      {/* 2. 4 Academic KPIs Grid */}
      <DashboardKpis
        onGoToMaterias={() => goTo('materias')}
        onGoToCalendario={() => goTo('calendario')}
      />

      {/* 3. Main 2-Column Split */}
      <div className={styles.dashboardSplit}>
        {/* Left Column: Próximas Evaluaciones + Calendario Banner + Curva Histórica */}
        <div className={styles.leftColumn}>
          <UpcomingEvaluations
            onGoToMaterias={() => goTo('materias')}
            onGoToApuntes={() => goTo('apuntes')}
          />

          <ScheduleBanner onGoToCalendario={() => goTo('calendario')} />

          <AcademicProgressChart />
        </div>

        {/* Right Column: Sesión Pomodoro + Notas Recientes + Atajos */}
        <div className={styles.rightColumn}>
          <PomodoroWidget onStartPomodoro={onStartPomodoro} />

          <RecentNotesWidget onGoToApuntes={() => goTo('apuntes')} />

          <KeyboardShortcutsWidget
            onOpenNoteModal={onOpenNoteModal}
            onOpenEvaluationModal={onOpenEvaluationModal}
            onStartPomodoro={onStartPomodoro}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
