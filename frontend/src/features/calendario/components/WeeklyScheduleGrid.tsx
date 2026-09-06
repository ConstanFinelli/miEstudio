import React, { useState, useMemo } from 'react';
import styles from './WeeklyScheduleGrid.module.css';
import {
  Clock,
  Building2,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import type { HorarioCursada, DiaSemana } from '../../../types/academic';
import { useHorarios, useMaterias } from '../../../hooks';
import { HorarioModal } from '../../../components/modals';

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
    return horarios.some(h => h.diaSemana === 'SABADO');
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<HorarioCursada | null>(null);
  const [defaultDia, setDefaultDia] = useState<DiaSemana>('LUNES');

  // Check today's day of week (0=Sunday, 1=Monday ... 6=Saturday)
  const currentDayIndex = new Date().getDay();

  // El horario se forma solo con materias con estado 'CURSANDO'
  const filteredHorarios = useMemo(() => {
    return horarios.filter(h => {
      const mat = materias.find(m => m.id === h.materiaId);
      // Si la materia existe y no está CURSANDO, se excluye del horario
      if (mat && mat.estado !== 'CURSANDO') return false;
      if (filterCuatri !== 'TODOS' && mat && mat.cuatrimestre !== filterCuatri) return false;
      return true;
    });
  }, [horarios, materias, filterCuatri]);


  // Active days list (Mon-Fri or Mon-Sat)
  const activeDays = useMemo(() => {
    const hasSabado = showSaturday || filteredHorarios.some(h => h.diaSemana === 'SABADO');
    return hasSabado ? ALL_DAYS : ALL_DAYS.slice(0, 5);
  }, [showSaturday, filteredHorarios]);

  // Dynamic time bounds
  const { minHour, maxHour, totalMinutes } = useMemo(() => {
    let minH = 8;
    let maxH = 22;

    filteredHorarios.forEach(h => {
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

    filteredHorarios.forEach(h => {
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
    return filteredHorarios.map(h => {
      const mat = materias.find(m => m.id === h.materiaId);
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
    const layouts: Record<DiaSemana, Array<{
      horario: HorarioCursada;
      topPercent: number;
      heightPercent: number;
      hasConflict: boolean;
      colIndex: number;
      colTotal: number;
    }>> = {
      LUNES: [],
      MARTES: [],
      MIERCOLES: [],
      JUEVES: [],
      VIERNES: [],
      SABADO: []
    };

    activeDays.forEach(day => {
      const dayItems = enrichedHorarios.filter(h => h.diaSemana === day.id);
      const parsedItems = dayItems.map(h => {
        const startMin = parseTimeToMinutes(h.horaInicio);
        const endMin = parseTimeToMinutes(h.horaFin);
        const top = Math.max(0, ((startMin - minHour * 60) / totalMinutes) * 100);
        const height = Math.max(4, ((endMin - startMin) / totalMinutes) * 100);
        return {
          horario: h,
          startMin,
          endMin,
          topPercent: top,
          heightPercent: height,
          hasConflict: false,
          colIndex: 0,
          colTotal: 1
        };
      });

      // Simple cluster detection for side-by-side rendering & conflicts
      for (let i = 0; i < parsedItems.length; i++) {
        for (let j = i + 1; j < parsedItems.length; j++) {
          const a = parsedItems[i];
          const b = parsedItems[j];
          if (a.startMin < b.endMin && b.startMin < a.endMin) {
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
      <div className={styles.topBar}>
        <div className={styles.metricsRow}>
          <div className={styles.metricBadge}>
            <Clock size={13} style={{ color: 'var(--primary)' }} />
            <span>Carga Semanal: <strong>{stats.totalHoursStr}</strong></span>
          </div>
          <div className={styles.metricBadge}>
            <span>Materias: <strong>{stats.distinctMateriasCount} activas</strong></span>
          </div>
          {stats.distinctSedes.length > 0 && (
            <div className={styles.metricBadge}>
              <Building2 size={13} style={{ color: 'var(--emerald)' }} />
              <span>
                {stats.distinctSedes.length === 1
                  ? stats.distinctSedes[0]
                  : `${stats.distinctSedes.length} sedes / facultades`}
              </span>
            </div>
          )}
        </div>

        <div className={styles.actionsRight}>
          <label className={styles.saturdayToggle}>
            <input
              type="checkbox"
              checked={showSaturday}
              onChange={e => setShowSaturday(e.target.checked)}
            />
            <span>Incluir Sábados</span>
          </label>

          <button className={styles.btnAddHorario} onClick={() => handleOpenAddModal()}>
            <Plus size={14} />
            <span>+ Horario de Cursada</span>
          </button>
        </div>
      </div>

      {/* 2. Schedule Grid / Empty State */}
      {horarios.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <Calendar size={28} />
          </div>
          <h3 className={styles.emptyTitle}>Sin Horarios de Cursada Configurados</h3>
          <p className={styles.emptyDesc}>
            Armá tu cronograma semanal de clases con total flexibilidad de bandas horarias, sedes universitarias y modalidades.
          </p>
          <button className={styles.btnAddHorario} onClick={() => handleOpenAddModal()}>
            <Plus size={14} />
            <span>Configurar Primer Horario</span>
          </button>
        </div>
      ) : filteredHorarios.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <Clock size={28} />
          </div>
          <h3 className={styles.emptyTitle}>Sin materias activas en cursada</h3>
          <p className={styles.emptyDesc}>
            El cronograma semanal se forma únicamente con materias con estado <strong>Cursando</strong>.
          </p>
        </div>
      ) : (


        <div className={styles.gridWrapper}>
          {/* Header Row: Days */}
          <div
            className={styles.gridHeader}
            style={{
              gridTemplateColumns: `60px repeat(${activeDays.length}, 1fr)`
            }}
          >
            <div className={styles.timeColHeader}>HORA</div>
            {activeDays.map(d => {
              const isToday = d.dayIndex === currentDayIndex;
              return (
                <div
                  key={d.id}
                  className={`${styles.dayColHeader} ${isToday ? styles.dayColHeaderToday : ''}`}
                >
                  {d.label.toUpperCase()} {isToday ? '· HOY' : ''}
                </div>
              );
            })}
          </div>

          {/* Grid Body: Continuous Time Rail and Day Columns */}
          <div
            className={styles.gridBody}
            style={{
              gridTemplateColumns: `60px repeat(${activeDays.length}, 1fr)`
            }}
          >
            {/* Time Axis Column */}
            <div className={styles.timeAxis}>
              {hourMarks.map(h => {
                const topPct = ((h - minHour) / (maxHour - minHour)) * 100;
                return (
                  <span
                    key={h}
                    className={styles.timeLabel}
                    style={{ top: `${topPct}%` }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </span>
                );
              })}
            </div>

            {/* Day Columns */}
            {activeDays.map(d => {
              const isToday = d.dayIndex === currentDayIndex;
              const items = dayLayouts[d.id] || [];

              return (
                <div
                  key={d.id}
                  className={`${styles.dayColumn} ${isToday ? styles.dayColumnToday : ''}`}
                  onDoubleClick={() => handleOpenAddModal(d.id)}
                  title={`Doble clic para agregar clase el ${d.label}`}
                >
                  {/* Horizontal Hour Reference Lines */}
                  {hourMarks.map(h => {
                    const topPct = ((h - minHour) / (maxHour - minHour)) * 100;
                    return (
                      <div
                        key={h}
                        className={styles.hourLine}
                        style={{ top: `${topPct}%` }}
                      />
                    );
                  })}

                  {/* Class Block Cards */}
                  {items.map(item => {
                    const h = item.horario;
                    const cardColor = h.materiaColor || '#6366f1';
                    const colWidth = 100 / item.colTotal;
                    const leftOffset = item.colIndex * colWidth;

                    return (
                      <div
                        key={h.id}
                        className={`${styles.classCard} ${item.hasConflict ? styles.classCardConflict : ''}`}
                        style={{
                          top: `${item.topPercent}%`,
                          height: `${item.heightPercent}%`,
                          left: `${leftOffset}%`,
                          width: `calc(${colWidth}% - 4px)`,
                          backgroundColor: `${cardColor}20`,
                          border: `1px solid ${cardColor}60`,
                          borderLeft: `4px solid ${cardColor}`
                        }}
                        onClick={() => handleCardClick(h)}
                      >
                        {item.hasConflict && (
                          <div className={styles.conflictBadge}>
                            <AlertTriangle size={9} /> Solapamiento
                          </div>
                        )}

                        <div className={styles.cardTop}>
                          <div className={styles.cardTitleGroup}>
                            <span className={styles.cardSubjectName} title={h.materiaNombre}>
                              {h.materiaNombre}
                            </span>
                            <span className={styles.cardSubjectCode}>
                              {h.materiaCodigo ? `[${h.materiaCodigo}]` : ''}
                            </span>
                          </div>

                          <div className={styles.cardActions}>
                            <button
                              className={styles.iconBtn}
                              title="Editar"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(h);
                              }}
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              className={styles.iconBtn}
                              title="Eliminar"
                              onClick={(e) => handleDeleteCard(e, h.id, h.materiaNombre)}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        <div className={styles.cardTime}>
                          <Clock size={10} />
                          <span>{h.horaInicio} - {h.horaFin} hs</span>
                        </div>

                        <div className={styles.cardFooter}>
                          {h.facultadSede ? (
                            <span className={styles.locationBadge} title={h.facultadSede}>
                              <Building2 size={9} /> {h.facultadSede}
                            </span>
                          ) : h.aula ? (
                            <span className={styles.locationBadge}>
                              <MapPin size={9} /> {h.aula}
                            </span>
                          ) : null}

                          {h.tipoClase && (
                            <span className={styles.typeBadge}>
                              {h.tipoClase}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
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
