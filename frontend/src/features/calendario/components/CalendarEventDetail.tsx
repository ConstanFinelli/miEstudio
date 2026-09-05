import React from 'react';
import styles from '../CalendarioView.module.css';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { EventoCalendario } from '../../../types/academic';

interface CalendarEventDetailProps {
  selectedEvent: EventoCalendario;
  onSelectEventId: (id: string) => void;
}

export const CalendarEventDetail: React.FC<CalendarEventDetailProps> = ({
  selectedEvent,
  onSelectEventId
}) => {
  return (
    <aside className={styles.sideDetailColumn}>
      {/* Selected Event Details */}
      <div className={styles.eventDetailBox}>
        <div className={styles.detailTitleRow}>
          <h3 className={styles.detailEventTitle}>{selectedEvent.titulo}</h3>
          <span className={styles.detailTagExam}>{selectedEvent.tipo}</span>
        </div>

        <div className={styles.eventInfoGrid}>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Fecha</span>
            <span className={styles.infoVal}>
              {new Date(selectedEvent.fecha).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })}
            </span>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Horario</span>
            <span className={styles.infoVal}>{selectedEvent.horarioInicio} - {selectedEvent.horarioFin} hs</span>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Aula</span>
            <span className={styles.infoVal}>{selectedEvent.aula || 'Pabellón 1 · Aula 302'}</span>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Modalidad</span>
            <span className={styles.infoVal}>{selectedEvent.modalidad || 'Presencial / Escrito'}</span>
          </div>
        </div>

        {selectedEvent.impactoAcademico && (
          <div className={styles.academicImpactBox}>
            <span className={styles.impactHeader}>IMPACTO ACADÉMICO: {selectedEvent.impactoAcademico}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--red)' }}>
              <AlertTriangle size={12} />
              <span>Condición crítica para promoción directa</span>
            </div>
          </div>
        )}

        {/* Hitos de Estudio */}
        <div className={styles.hitosSection}>
          <div className={styles.hitosHeader}>
            <span>HITOS DE ESTUDIO (1/2)</span>
            <span style={{ color: 'var(--emerald)' }}>RF3.2 SYNC</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className={styles.hitoItem}>
              <CheckCircle2 size={13} color="var(--emerald)" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  Resumen de paper Raft (Ongaro & Ousterhout)
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  Completado · 19 Abr
                </div>
              </div>
            </div>

            <div className={styles.hitoItem}>
              <div style={{ width: '13px', height: '13px', border: '1px solid var(--border-hover)', borderRadius: '2px', marginTop: '2px' }} />
              <div>
                <div style={{ color: 'var(--text-primary)' }}>
                  Simulación de algoritmos de elección de líder
                </div>
                <div style={{ fontSize: '10px', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                  Pendiente · Alta prioridad
                </div>
              </div>
            </div>
          </div>

          <button className={styles.btnLinkHito} onClick={() => alert('Vincular recordatorio de estudio')}>
            + Vincular recordatorio de estudio
          </button>
        </div>
      </div>

      {/* Próximos 7 días */}
      <div className={styles.upcomingCard}>
        <div className={styles.upcomingHeader}>
          <span>Próximos 7 días</span>
          <span>3 eventos</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className={styles.upcomingItem} onClick={() => onSelectEventId('evt-3')}>
            <div className={styles.upcomingLeft}>
              <span className={styles.upcomingTitle}>Sesión Estudio Raft</span>
              <span className={styles.upcomingMeta}>Hoy 18:00 - 20:00 hs</span>
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--emerald)', background: 'var(--emerald-alpha)', padding: '2px 5px', borderRadius: '2px' }}>
              ESTUDIO
            </span>
          </div>

          <div className={styles.upcomingItem} onClick={() => onSelectEventId('evt-1')}>
            <div className={styles.upcomingLeft}>
              <span className={styles.upcomingTitle}>1° Parcial Distribuidos</span>
              <span className={styles.upcomingMeta}>Jue 24 · 09:00 hs (Aula 302)</span>
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--red)', background: 'var(--red-alpha)', padding: '2px 5px', borderRadius: '2px' }}>
              PARCIAL
            </span>
          </div>

          <div className={styles.upcomingItem} onClick={() => onSelectEventId('evt-2')}>
            <div className={styles.upcomingLeft}>
              <span className={styles.upcomingTitle}>TP Entrega BD II</span>
              <span className={styles.upcomingMeta}>Mar 29 · 23:59 hs (Campus)</span>
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--purple)', background: 'var(--purple-alpha)', padding: '2px 5px', borderRadius: '2px' }}>
              ENTREGA
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CalendarEventDetail;
