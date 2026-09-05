import React, { useState, useEffect } from 'react';
import styles from './CalendarioView.module.css';
import type { EventoCalendario } from '../../types/academic';
import { useCalendario } from '../../hooks';
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
  const { eventos } = useCalendario();
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-1');
  const [viewMode, setViewMode] = useState<'mes' | 'semana' | 'agenda'>('mes');

  useEffect(() => {
    if (eventos.length > 0 && (!selectedEventId || !eventos.find(e => e.id === selectedEventId))) {
      setSelectedEventId(eventos[0].id);
    }
  }, [eventos, selectedEventId]);

  const selectedEvent: EventoCalendario =
    eventos.find(e => e.id === selectedEventId) ||
    eventos[0] || {
      id: 'evt-empty',
      titulo: 'Sin eventos programados',
      tipo: 'ESTUDIO',
      fecha: new Date().toISOString().split('T')[0],
      horarioInicio: '09:00',
      horarioFin: '11:00'
    };

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
