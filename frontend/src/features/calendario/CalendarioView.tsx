import React, { useState, useEffect, useMemo } from "react";
import styles from "./CalendarioView.module.css";
import type { EventoCalendario, TipoEvento } from "../../types/academic";
import { useCalendario, useEvaluaciones } from "../../hooks";
import {
  CalendarTopNav,
  CalendarFiltersBar,
  CalendarMonthGrid,
  CalendarEventDetail,
} from "./components";

interface CalendarioViewProps {
  onOpenEvaluationModal: () => void;
}

export const CalendarioView: React.FC<CalendarioViewProps> = ({
  onOpenEvaluationModal,
}) => {
  const { eventos } = useCalendario();
  const { evaluaciones, deleteEvaluacion } = useEvaluaciones();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const handleDeleteEvent = async (id: string, titulo: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar "${titulo}" del calendario?`,
    );
    if (!confirmDelete) return;

    try {
      await deleteEvaluacion(id);
      if (selectedEventId === id) {
        setSelectedEventId(null);
      }
    } catch (err) {
      console.error("Error al eliminar evaluación:", err);
      alert("Ocurrió un error al eliminar la evaluación.");
    }
  };

  // Merge calendar events with actual academic evaluations
  const combinedEvents = useMemo(() => {
    const evalAsEvents: EventoCalendario[] = evaluaciones.map((ev) => {
      const evDate = ev.fecha.includes("T") ? ev.fecha.split("T")[0] : ev.fecha;
      let tipoEvento: TipoEvento = "EXAMEN";
      if (ev.tipo === "TP") tipoEvento = "ENTREGA";
      else if (ev.tipo === "LABORATORIO") tipoEvento = "LABORATORIO";
      else if (ev.tipo === "QUIZ") tipoEvento = "ESTUDIO";
      else tipoEvento = "EXAMEN";

      return {
        id: ev.id,
        titulo: `${ev.materiaCodigo ? ev.materiaCodigo + " - " : ""}${ev.titulo}`,
        materiaId: ev.materiaId,
        materiaCodigo: ev.materiaCodigo,
        materiaNombre: ev.materiaNombre,
        tipo: tipoEvento,
        fecha: evDate,
        horarioInicio: ev.horario || "09:00",
        horarioFin: "11:00",
        aula: ev.aula,
        modalidad: ev.modalidad,
        impactoAcademico: ev.peso ? `${ev.peso}% de la nota final` : undefined,
        esCritico: ev.esAprobatorio || ev.peso >= 30,
      };
    });

    const evalIds = new Set(evalAsEvents.map((e) => e.id));
    const otherEvents = eventos.filter((e) => !evalIds.has(e.id));
    return [...evalAsEvents, ...otherEvents];
  }, [evaluaciones, eventos]);

  // Filter events based on selected filter badge, year and cuatrimestre
  const filteredEvents = useMemo(() => {
    let list = combinedEvents;

    if (selectedFilter === "EXAMEN") {
      list = list.filter((e) => e.tipo === "EXAMEN");
    } else if (selectedFilter === "TP") {
      list = list.filter((e) => e.tipo === "ENTREGA");
    } else if (selectedFilter === "LAB") {
      list = list.filter((e) => e.tipo === "LABORATORIO");
    } else if (selectedFilter === "ESTUDIO") {
      list = list.filter((e) => e.tipo === "ESTUDIO" || e.tipo === "CONSULTA");
    }

    return list;
  }, [combinedEvents, selectedFilter]);

  // Keep selected event in sync
  useEffect(() => {
    if (combinedEvents.length > 0) {
      if (
        !selectedEventId ||
        !combinedEvents.some((e) => e.id === selectedEventId)
      ) {
        setSelectedEventId(combinedEvents[0].id);
      }
    } else {
      setSelectedEventId(null);
    }
  }, [combinedEvents, selectedEventId]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return combinedEvents.find((e) => e.id === selectedEventId) || null;
  }, [combinedEvents, selectedEventId]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className={styles.container}>
      {/* 1. Top Navigation Bar with Dynamic Month Navigation */}
      <CalendarTopNav
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onOpenEvaluationModal={onOpenEvaluationModal}
      />

      {/* 2. Filters Row */}
      <CalendarFiltersBar
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />

      {/* 3. Calendar Grid + Detail Sidebar Split */}
      <div className={styles.calendarSplit}>
        <CalendarMonthGrid
          currentDate={currentDate}
          events={filteredEvents}
          selectedEventId={selectedEventId}
          onSelectEventId={(id) => {
            setSelectedEventId(id);
            setSelectedDateStr(null);
          }}
          selectedDateStr={selectedDateStr}
          onSelectDate={(dateStr) => {
            setSelectedDateStr(dateStr);
            setSelectedEventId(null);
          }}
        />

        <CalendarEventDetail
          selectedEvent={selectedEvent}
          allEvents={combinedEvents}
          onSelectEventId={(id) => {
            setSelectedEventId(id);
            setSelectedDateStr(null);
          }}
          onOpenEvaluationModal={onOpenEvaluationModal}
          onDeleteEvent={handleDeleteEvent}
        />
      </div>
    </div>
  );
};

export default CalendarioView;
