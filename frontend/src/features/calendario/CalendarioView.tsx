import React, { useState } from 'react';
import styles from './CalendarioView.module.css';
import { mockEventosCalendario } from '../../data/mockData';
import type { EventoCalendario } from '../../types/academic';
import {
  CalendarTopNav,
  CalendarFiltersBar,
  CalendarMonthGrid,
  CalendarEventDetail
} from './components';

interface CalendarioViewProps {
  onOpenEvaluationModal: () => void;
}

export const CalendarioView: React.FC<CalendarioViewProps> = ({ onOpenEvaluationModal }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-1');
  const [viewMode, setViewMode] = useState<'mes' | 'semana' | 'agenda'>('mes');

  const selectedEvent: EventoCalendario =
    mockEventosCalendario.find(e => e.id === selectedEventId) || mockEventosCalendario[0];

  return (
    <div className={styles.container}>
      {/* 1. Top Navigation Bar */}
      <CalendarTopNav
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenEvaluationModal={onOpenEvaluationModal}
      />

      {/* 2. Filters Row */}
      <CalendarFiltersBar />

      {/* 3. Calendar Grid + Detail Sidebar Split */}
      <div className={styles.calendarSplit}>
        <CalendarMonthGrid
          selectedEventId={selectedEventId}
          onSelectEventId={setSelectedEventId}
        />

        <CalendarEventDetail
          selectedEvent={selectedEvent}
          onSelectEventId={setSelectedEventId}
        />
      </div>
    </div>
  );
};

export default CalendarioView;
