import React, { useState, useEffect, useMemo } from "react";
import styles from "./CalendarioView.module.css";
import type { EventoCalendario, TipoEvento, InstanciaEvaluacion } from "../../types/academic";
import { useCalendario, useEvaluaciones, useMaterias } from "../../hooks";
import { useAuth } from "../../context/AuthContext";
import { parseLocalDate } from "../../utils";
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
  const { materias } = useMaterias(undefined, undefined, "ALL");
  const { activeCarrera } = useAuth();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [carreraFilter, setCarreraFilter] = useState<"ALL" | "ACTIVE">("ALL");

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  // Auto-focus and jump month when an evaluation is created or updated
  useEffect(() => {
    const handleEvalCreatedOrUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<InstanciaEvaluacion | undefined>;
      const createdOrUpdated = customEvent.detail;
      if (createdOrUpdated?.id && createdOrUpdated.fecha) {
        const targetDate = parseLocalDate(createdOrUpdated.fecha);
        const isPast =
          (createdOrUpdated.nota !== null && createdOrUpdated.nota !== undefined) ||
          createdOrUpdated.estado === "CALIFICADO" ||
          (targetDate ? targetDate.getTime() < todayStart : true);

        if (!isPast) {
          setSelectedEventId(createdOrUpdated.id);
          const datePart = createdOrUpdated.fecha.includes("T")
            ? createdOrUpdated.fecha.split("T")[0]
            : createdOrUpdated.fecha;
          const parts = datePart.split("-").map(Number);
          if (parts.length >= 2 && parts[0] && parts[1]) {
            setCurrentDate(new Date(parts[0], parts[1] - 1, parts[2] || 1));
          }
        } else if (selectedEventId === createdOrUpdated.id) {
          setSelectedEventId(null);
        }
      }
    };
    window.addEventListener("evaluaciones:updated", handleEvalCreatedOrUpdated);
    return () =>
      window.removeEventListener(
        "evaluaciones:updated",
        handleEvalCreatedOrUpdated,
      );
  }, [todayStart, selectedEventId]);

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

  // Merge calendar events with actual academic evaluations (excluding evaluations already passed or graded)
  const combinedEvents = useMemo(() => {
    const evalAsEvents: EventoCalendario[] = evaluaciones
      .filter((ev): ev is typeof ev & { fecha: string } => {
        if (!ev.fecha) return false;
        // Si ya tiene nota asignada o está calificada, es una evaluación ya rendida/pasada
        if (ev.nota !== null && ev.nota !== undefined) return false;
        if (ev.estado === "CALIFICADO") return false;
        // Si la fecha es anterior al inicio del día de hoy, la evaluación ya pasó
        const targetDate = parseLocalDate(ev.fecha);
        if (!targetDate || targetDate.getTime() < todayStart) return false;
        return true;
      })
      .map((ev) => {
        const evDate = ev.fecha.includes("T") ? ev.fecha.split("T")[0] : ev.fecha;
        let tipoEvento: TipoEvento = "EXAMEN";
        if (ev.tipo === "TP") tipoEvento = "ENTREGA";
        else if (ev.tipo === "LABORATORIO") tipoEvento = "LABORATORIO";
        else if (ev.tipo === "QUIZ") tipoEvento = "ESTUDIO";
        else tipoEvento = "EXAMEN";

        const matchedMateria = materias.find((m) => m.id === ev.materiaId);
        const matCodigo =
          matchedMateria?.codigo ||
          (ev.materiaCodigo && ev.materiaCodigo !== "MAT"
            ? ev.materiaCodigo
            : "");
        const matNombre =
          matchedMateria?.nombre ||
          (ev.materiaNombre && ev.materiaNombre !== "Materia"
            ? ev.materiaNombre
            : "Materia");
        const evCarreraId = ev.carreraId || matchedMateria?.carreraId;

        return {
          id: ev.id,
          titulo: `${matCodigo ? matCodigo + " - " : ""}${ev.titulo}`,
          materiaId: ev.materiaId,
          materiaCodigo: matCodigo,
          materiaNombre: matNombre,
          carreraId: evCarreraId,
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

    const allEvalIds = new Set(evaluaciones.map((e) => e.id));
    const otherEvents = eventos
      .filter((e) => !allEvalIds.has(e.id))
      .filter((e) => {
        if (!e.fecha) return false;
        const targetDate = parseLocalDate(e.fecha);
        return targetDate ? targetDate.getTime() >= todayStart : false;
      })
      .map((e) => {
        if (!e.carreraId && e.materiaId) {
          const m = materias.find((mat) => mat.id === e.materiaId);
          return { ...e, carreraId: m?.carreraId };
        }
        return e;
      });

    return [...evalAsEvents, ...otherEvents];
  }, [evaluaciones, eventos, materias, todayStart]);

  // Filter events based on selected career and type filters
  const filteredEvents = useMemo(() => {
    let list = combinedEvents;

    if (carreraFilter === "ACTIVE" && activeCarrera?.id) {
      list = list.filter((e) => {
        const evCarreraId =
          e.carreraId ||
          (e.materiaId ? materias.find((m) => m.id === e.materiaId)?.carreraId : undefined);
        return evCarreraId === activeCarrera.id;
      });
    }

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
  }, [combinedEvents, selectedFilter, carreraFilter, activeCarrera, materias]);

  // Keep selected event in sync
  useEffect(() => {
    if (filteredEvents.length > 0) {
      if (
        !selectedEventId ||
        !filteredEvents.some((e) => e.id === selectedEventId)
      ) {
        setSelectedEventId(filteredEvents[0].id);
      }
    } else {
      setSelectedEventId(null);
    }
  }, [filteredEvents, selectedEventId]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return filteredEvents.find((e) => e.id === selectedEventId) || null;
  }, [filteredEvents, selectedEventId]);

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

      {/* 2. Filters Row with Career and Type filters */}
      <CalendarFiltersBar
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        carreraFilter={carreraFilter}
        onSelectCarreraFilter={setCarreraFilter}
        activeCarreraNombre={activeCarrera?.nombre}
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
          allEvents={filteredEvents}
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
