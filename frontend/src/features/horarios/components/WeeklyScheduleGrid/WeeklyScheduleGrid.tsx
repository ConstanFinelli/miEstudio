import React, { useState, useMemo } from 'react';
import styles from './WeeklyScheduleGrid.module.css';
import type { HorarioCursada, DiaSemana } from '../../../../types/academic';
import { useHorarios, useMaterias } from '../../../../hooks';
import { HorarioModal } from '../../../../components/modals';
import type { ScheduleLayoutItem } from '../ScheduleCard';
import { ScheduleDayColumn } from '../ScheduleDayColumn';
import { ScheduleMetricsBar } from '../ScheduleMetricsBar';
import { ScheduleEmptyState } from '../ScheduleEmptyState';
import { ScheduleGridHeader } from '../ScheduleGridHeader';
import { ScheduleTimeAxis } from '../ScheduleTimeAxis';

const ALL_DAYS: { id: DiaSemana; label: string; short: string; dayIndex: number }[] = [
  { id: 'LUNES', label: 'Lunes', short: 'Lun', dayIndex: 1 },
  { id: 'MARTES', label: 'Martes', short: 'Mar', dayIndex: 2 },
  { id: 'MIERCOLES', label: 'Miércoles', short: 'Mié', dayIndex: 3 },
  { id: 'JUEVES', label: 'Jueves', short: 'Jue', dayIndex: 4 },
  { id: 'VIERNES', label: 'Viernes', short: 'Vie', dayIndex: 5 },
  { id: 'SABADO', label: 'Sábado', short: 'Sáb', dayIndex: 6 },
];

const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

interface WeeklyScheduleGridProps {
  filterCuatri?: 'TODOS' | '1C' | '2C' | 'Anual';
}

export const WeeklyScheduleGrid: React.FC<WeeklyScheduleGridProps> = ({
  filterCuatri = 'TODOS'
}) => {
  const { horarios, deleteHorario, refresh } = useHorarios();
  const { materias } = useMaterias();

  const [showSaturday, setShowSaturday] = useState<boolean>(() => {
    return horarios.some((h) => h.diaSemana === 'SABADO');
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<HorarioCursada | null>(null);
  const [defaultDia, setDefaultDia] = useState<DiaSemana>('LUNES');

  // Check today's day of week (0=Sunday, 1=Monday ... 6=Saturday)
  const currentDayIndex = new Date().getDay();

  // El horario se forma solo con materias con estado 'CURSANDO'
  const filteredHorarios = useMemo(() => {
    return horarios.filter((h) => {
      const mat = materias.find((m) => m.id === h.materiaId);
      // Si la materia existe y no está CURSANDO, se excluye del horario
      if (mat && mat.estado !== 'CURSANDO') return false;
      if (filterCuatri !== 'TODOS' && mat && mat.cuatrimestre !== filterCuatri) {
        return false;
      }
      return true;
    });
  }, [horarios, materias, filterCuatri]);

  // Active days list (Mon-Fri or Mon-Sat)
  const activeDays = useMemo(() => {
    const hasSabado = showSaturday || filteredHorarios.some((h) => h.diaSemana === 'SABADO');
    return hasSabado ? ALL_DAYS : ALL_DAYS.slice(0, 5);
  }, [showSaturday, filteredHorarios]);

  // Dynamic time bounds
  const { minHour, maxHour, totalMinutes } = useMemo(() => {
    let minH = 8;
    let maxH = 22;

    filteredHorarios.forEach((h) => {
      const startMin = parseTimeToMinutes(h.horaInicio);
      const endMin = parseTimeToMinutes(h.horaFin);
      const startH = Math.floor(startMin / 60);
      const endH = Math.ceil(endMin / 60);

      if (startH < minH) minH = Math.max(6, startH);
      if (endH > maxH) maxH = Math.min(24, endH);
    });

    const totMins = (maxH - minH) * 60;
    return { minHour: minH, maxHour: maxH, totalMinutes: totMins || 60 };
  }, [filteredHorarios]);

  // Array of hours for horizontal grid lines
  const hourMarks = useMemo(() => {
    const hours: number[] = [];
    for (let h = minHour; h <= maxHour; h++) {
      hours.push(h);
    }
    return hours;
  }, [minHour, maxHour]);

  // Overall statistics
  const stats = useMemo(() => {
    let totalMins = 0;
    const sedesSet = new Set<string>();
    const materiasSet = new Set<string>();

    filteredHorarios.forEach((h) => {
      const diff = parseTimeToMinutes(h.horaFin) - parseTimeToMinutes(h.horaInicio);
      if (diff > 0) totalMins += diff;
      if (h.facultadSede?.trim()) sedesSet.add(h.facultadSede.trim());
      if (h.materiaId) materiasSet.add(h.materiaId);
    });

    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const hoursStr = mins > 0 ? `${hours}h ${mins}m` : `${hours}hs`;

    return {
      totalHoursStr: hoursStr,
      distinctMateriasCount: materiasSet.size,
      distinctSedes: Array.from(sedesSet)
    };
  }, [filteredHorarios]);

  // Enrich horarios with materia details (color, name, code)
  const enrichedHorarios = useMemo(() => {
    return filteredHorarios.map((h) => {
      const mat = materias.find((m) => m.id === h.materiaId);
      return {
        ...h,
        materiaNombre: mat?.nombre || h.materiaNombre || 'Materia',
        materiaCodigo: mat?.codigo || h.materiaCodigo || 'MAT',
        materiaColor: mat?.color || h.materiaColor || '#6366f1'
      };
    });
  }, [filteredHorarios, materias]);

  // Overlap and layout calculation per day
  const dayLayouts = useMemo(() => {
    const layouts: Record<DiaSemana, ScheduleLayoutItem[]> = {
      LUNES: [],
      MARTES: [],
      MIERCOLES: [],
      JUEVES: [],
      VIERNES: [],
      SABADO: []
    };

    activeDays.forEach((day) => {
      const dayItems = enrichedHorarios.filter((h) => h.diaSemana === day.id);
      const parsedItems: ScheduleLayoutItem[] = dayItems.map((h) => {
        const startMin = parseTimeToMinutes(h.horaInicio);
        const endMin = parseTimeToMinutes(h.horaFin);
        const top = Math.max(0, ((startMin - minHour * 60) / totalMinutes) * 100);
        const height = Math.max(4, ((endMin - startMin) / totalMinutes) * 100);
        return {
          horario: h,
          topPercent: top,
          heightPercent: height,
          hasConflict: false,
          colIndex: 0,
          colTotal: 1
        };
      });

      // Cluster detection for side-by-side rendering & conflicts
      for (let i = 0; i < parsedItems.length; i++) {
        for (let j = i + 1; j < parsedItems.length; j++) {
          const a = parsedItems[i];
          const b = parsedItems[j];
          const startA = parseTimeToMinutes(a.horario.horaInicio);
          const endA = parseTimeToMinutes(a.horario.horaFin);
          const startB = parseTimeToMinutes(b.horario.horaInicio);
          const endB = parseTimeToMinutes(b.horario.horaFin);

          if (startA < endB && startB < endA) {
            a.hasConflict = true;
            b.hasConflict = true;
            b.colIndex = (a.colIndex + 1) % 2;
            a.colTotal = 2;
            b.colTotal = 2;
          }
        }
      }

      layouts[day.id] = parsedItems;
    });

    return layouts;
  }, [activeDays, enrichedHorarios, minHour, totalMinutes]);

  const handleOpenAddModal = (dia?: DiaSemana) => {
    setEditingHorario(null);
    setDefaultDia(dia || 'LUNES');
    setModalOpen(true);
  };

  const handleCardClick = (h: HorarioCursada) => {
    setEditingHorario(h);
    setModalOpen(true);
  };

  const handleDeleteCard = async (e: React.MouseEvent, id: string, name?: string) => {
    e.stopPropagation();
    const confirmed = window.confirm(`¿Eliminar horario de cursada de ${name || 'la materia'}?`);
    if (confirmed) {
      await deleteHorario(id);
      refresh();
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. Header Bar: Metrics & Actions */}
      <ScheduleMetricsBar
        totalHoursStr={stats.totalHoursStr}
        distinctMateriasCount={stats.distinctMateriasCount}
        distinctSedes={stats.distinctSedes}
        showSaturday={showSaturday}
        onToggleSaturday={setShowSaturday}
        onOpenAddModal={() => handleOpenAddModal()}
      />

      {/* 2. Schedule Grid / Empty State */}
      {filteredHorarios.length === 0 ? (
        <ScheduleEmptyState
          hasNoSchedules={horarios.length === 0}
          onOpenAddModal={() => handleOpenAddModal()}
        />
      ) : (
        <div className={styles.gridWrapper}>
          {/* Header Row: Days */}
          <ScheduleGridHeader
            activeDays={activeDays}
            currentDayIndex={currentDayIndex}
          />

          {/* Grid Body: Continuous Time Rail and Day Columns */}
          <div
            className={styles.gridBody}
            style={{
              gridTemplateColumns: `60px repeat(${activeDays.length}, 1fr)`
            }}
          >
            {/* Time Axis Column */}
            <ScheduleTimeAxis
              hourMarks={hourMarks}
              minHour={minHour}
              maxHour={maxHour}
            />

            {/* Day Columns with modular ScheduleCards */}
            {activeDays.map((d) => (
              <ScheduleDayColumn
                key={d.id}
                day={d}
                isToday={d.dayIndex === currentDayIndex}
                items={dayLayouts[d.id] || []}
                hourMarks={hourMarks}
                minHour={minHour}
                maxHour={maxHour}
                onOpenAddModal={handleOpenAddModal}
                onCardClick={handleCardClick}
                onCardDelete={handleDeleteCard}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <HorarioModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingHorario(null);
        }}
        onSuccess={() => {
          refresh();
        }}
        horarioToEdit={editingHorario}
        defaultDiaSemana={defaultDia}
      />
    </div>
  );
};

export default WeeklyScheduleGrid;
