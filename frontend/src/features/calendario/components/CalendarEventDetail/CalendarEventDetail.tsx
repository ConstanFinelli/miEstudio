import React, { useMemo } from 'react';
import styles from './CalendarEventDetail.module.css';
import { AlertTriangle, CheckCircle2, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import type { EventoCalendario } from '../../../../types/academic';

interface CalendarEventDetailProps {
  selectedEvent: EventoCalendario | null;
  allEvents: EventoCalendario[];
  onSelectEventId: (id: string) => void;
  onOpenEvaluationModal?: () => void;
  onDeleteEvent?: (id: string, titulo: string) => void;
}

export const CalendarEventDetail: React.FC<CalendarEventDetailProps> = ({
  selectedEvent,
  allEvents,
  onSelectEventId,
  onOpenEvaluationModal,
  onDeleteEvent
}) => {
  const todayStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Compute upcoming events from today onward (or next in list)
  const upcomingEvents = useMemo(() => {
    const future = allEvents
      .filter(e => e.fecha >= todayStr)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horarioInicio.localeCompare(b.horarioInicio));

    if (future.length > 0) return future.slice(0, 4);

    // Fallback: show most recent/upcoming from the whole list
    return [...allEvents]
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 4);
  }, [allEvents, todayStr]);

  const getTagBadgeStyle = (tipo: string) => {
    switch (tipo) {
      case 'EXAMEN':
      case 'PARCIAL':
      case 'FINAL':
        return {
          backgroundColor: 'var(--red-alpha)',
          color: 'var(--red)',
          border: '1px solid var(--red-border)'
        };
      case 'ENTREGA':
      case 'TP':
        return {
          backgroundColor: 'var(--purple-alpha)',
          color: 'var(--purple)',
          border: '1px solid var(--purple-border)'
        };
      case 'LAB':
      case 'LABORATORIO':
        return {
          backgroundColor: 'var(--blue-alpha)',
          color: 'var(--blue)',
          border: '1px solid var(--blue-border)'
        };
      case 'ESTUDIO':
      case 'CONSULTA':
      default:
        return {
          backgroundColor: 'var(--emerald-alpha)',
          color: 'var(--emerald)',
          border: '1px solid var(--emerald-border)'
        };
    }
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <aside className={styles.sideDetailColumn}>
      {/* 1. Selected Event Details or Empty State */}
      {selectedEvent ? (
        <div className={styles.eventDetailBox}>
          <div className={styles.detailTitleRow}>
            <h3 className={styles.detailEventTitle}>{selectedEvent.titulo}</h3>
            <span
              className={styles.detailTagExam}
              style={getTagBadgeStyle(selectedEvent.tipo)}
            >
              {selectedEvent.tipo}
            </span>
          </div>

          <div className={styles.eventInfoGrid}>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Fecha</span>
              <span className={styles.infoVal}>
                {formatEventDate(selectedEvent.fecha)}
              </span>
            </div>

            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Horario</span>
              <span className={styles.infoVal}>
                {selectedEvent.horarioInicio}
                {selectedEvent.horarioFin && selectedEvent.horarioFin !== selectedEvent.horarioInicio
                  ? ` - ${selectedEvent.horarioFin} hs`
                  : ' hs'}
              </span>
            </div>

            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Aula / Ubicación</span>
              <span className={styles.infoVal}>
                {selectedEvent.aula || 'Sin aula asignada'}
              </span>
            </div>

            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Modalidad</span>
              <span className={styles.infoVal}>
                {selectedEvent.modalidad || 'Presencial'}
              </span>
            </div>
          </div>

          {selectedEvent.impactoAcademico && (
            <div className={styles.academicImpactBox}>
              <span className={styles.impactHeader}>
                IMPACTO ACADÉMICO: {selectedEvent.impactoAcademico}
              </span>
              {selectedEvent.esCritico && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: 'var(--red)'
                  }}
                >
                  <AlertTriangle size={12} />
                  <span>Condición relevante para la aprobación o promoción</span>
                </div>
              )}
            </div>
          )}

          {/* Hitos reales si existen */}
          {selectedEvent.hitos && selectedEvent.hitos.length > 0 ? (
            <div className={styles.hitosSection}>
              <div className={styles.hitosHeader}>
                <span>
                  HITOS DE ESTUDIO ({selectedEvent.hitos.filter(h => h.completado).length}/{selectedEvent.hitos.length})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedEvent.hitos.map(hito => (
                  <div key={hito.id} className={styles.hitoItem}>
                    {hito.completado ? (
                      <CheckCircle2 size={13} color="var(--emerald)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    ) : (
                      <div
                        style={{
                          width: '13px',
                          height: '13px',
                          border: '1px solid var(--border-hover)',
                          borderRadius: '2px',
                          marginTop: '2px',
                          flexShrink: 0
                        }}
                      />
                    )}
                    <div>
                      <div
                        style={{
                          textDecoration: hito.completado ? 'line-through' : 'none',
                          color: hito.completado ? 'var(--text-muted)' : 'var(--text-primary)'
                        }}
                      >
                        {hito.texto}
                      </div>
                      {hito.fecha && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: 'var(--text-dim)',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {hito.completado ? 'Completado' : 'Pendiente'} · {hito.fecha}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {onDeleteEvent && (
            <button
              className={styles.btnDeleteEvent}
              onClick={() => onDeleteEvent(selectedEvent.id, selectedEvent.titulo)}
              title="Eliminar esta evaluación del calendario"
            >
              <Trash2 size={13} />
              <span>Eliminar Evaluación</span>
            </button>
          )}
        </div>
      ) : (
        <div
          className={styles.eventDetailBox}
          style={{
            textAlign: 'center',
            padding: '32px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <CalendarIcon size={36} color="var(--text-dim)" />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Ningún evento seleccionado
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              Seleccioná un día o evento en el calendario para inspeccionar fecha, horario y detalles.
            </p>
          </div>
          {onOpenEvaluationModal && (
            <button
              className={styles.btnNewEvent}
              style={{ marginTop: '8px' }}
              onClick={onOpenEvaluationModal}
            >
              + Nueva Fecha / Examen
            </button>
          )}
        </div>
      )}

      {/* 2. Próximos Días / Eventos Dinámicos */}
      <div className={styles.upcomingCard}>
        <div className={styles.upcomingHeader}>
          <span>Próximos Eventos</span>
          <span>{upcomingEvents.length} eventos</span>
        </div>

        {upcomingEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingEvents.map(ev => {
              const badgeStyle = getTagBadgeStyle(ev.tipo);
              const isSelected = selectedEvent?.id === ev.id;

              return (
                <div
                  key={ev.id}
                  className={styles.upcomingItem}
                  style={{
                    borderColor: isSelected ? 'var(--primary)' : undefined,
                    backgroundColor: isSelected ? 'var(--surface-3)' : undefined
                  }}
                  onClick={() => onSelectEventId(ev.id)}
                >
                  <div className={styles.upcomingLeft}>
                    <span className={styles.upcomingTitle}>{ev.titulo}</span>
                    <span className={styles.upcomingMeta}>
                      {formatEventDate(ev.fecha)} · {ev.horarioInicio} hs {ev.aula ? `(${ev.aula})` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 5px',
                        borderRadius: '2px',
                        ...badgeStyle
                      }}
                    >
                      {ev.tipo}
                    </span>
                    {onDeleteEvent && (
                      <button
                        className={styles.iconBtnDelete}
                        title="Eliminar evaluación"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(ev.id, ev.titulo);
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '20px 8px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '12px'
            }}
          >
            No hay eventos programados en este período.
          </div>
        )}
      </div>
    </aside>
  );
};

export default CalendarEventDetail;
