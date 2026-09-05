import React, { useState } from 'react';
import styles from './CalendarioView.module.css';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { mockEventosCalendario } from '../../data/mockData';
import type { EventoCalendario } from '../../types/academic';

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
      {/* Top Navigation */}
      <div className={styles.topNav}>
        <div className={styles.monthControls}>
          <button className={styles.arrowBtn}>
            <ChevronLeft size={14} />
          </button>
          <h2 className={styles.monthTitle}>Abril 2025</h2>
          <button className={styles.arrowBtn}>
            <ChevronRight size={14} />
          </button>
          <button className={styles.todayBtn}>HOY · 21 ABR</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={styles.viewModeGroup}>
            {(['mes', 'semana', 'agenda'] as const).map(mode => (
              <button
                key={mode}
                className={`${styles.viewBtn} ${viewMode === mode ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <button className={styles.btnNewEvent} onClick={onOpenEvaluationModal}>
            <Plus size={14} />
            <span>+ Nuevo Evento de Estudio (E)</span>
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className={styles.filtersRow}>
        <span>FILTRAR:</span>
        <div className={styles.filterItem}>
          <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--red)' }} />
          <span>Exámenes Parciales y Finales</span>
        </div>
        <div className={styles.filterItem}>
          <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--purple)' }} />
          <span>Trabajos Prácticos y Entregas</span>
        </div>
        <div className={styles.filterItem}>
          <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--blue)' }} />
          <span>Laboratorios</span>
        </div>
        <div className={styles.filterItem}>
          <span className={styles.filterColorDot} style={{ backgroundColor: 'var(--emerald)' }} />
          <span>Sesiones de Estudio / Recordatorios</span>
        </div>
      </div>

      {/* Calendar Split */}
      <div className={styles.calendarSplit}>
        {/* Calendar Grid */}
        <div className={styles.gridWrapper}>
          <div className={styles.daysHeaderRow}>
            {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
              <div key={d} className={styles.dayColHeader}>{d}</div>
            ))}
          </div>

          <div className={styles.cellsGrid}>
            {/* Week 1: 31 Mar to 06 Apr */}
            <div className={`${styles.dayCell} ${styles.dayCellOutside}`}><div className={styles.dayCellHeader}><span>31</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>01</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>02</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>03</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>04</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>05</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>06</span></div></div>

            {/* Week 2: 07 to 13 Apr */}
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>07</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>08</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>09</span></div></div>
            <div className={styles.dayCell}>
              <div className={styles.dayCellHeader}>
                <span>10</span>
                <span style={{ color: 'var(--emerald)', fontSize: '10px' }}>✔</span>
              </div>
              <div className={styles.eventBadgeTP}>TP Raft...</div>
            </div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>11</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>12</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>13</span></div></div>

            {/* Week 3: 14 to 20 Apr */}
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>14</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>15</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>16</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>17</span></div></div>
            <div className={styles.dayCell}>
              <div className={styles.dayCellHeader}>
                <span>18</span>
                <span style={{ color: 'var(--blue)', fontSize: '9px' }}>●</span>
              </div>
              <div className={styles.eventBadgeLab}>Lab: SQL... 14:00</div>
            </div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>19</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>20</span></div></div>

            {/* Week 4: 21 to 27 Apr */}
            <div className={`${styles.dayCell} ${selectedEventId === 'evt-3' ? styles.dayCellSelected : ''}`} onClick={() => setSelectedEventId('evt-3')}>
              <div className={styles.dayCellHeader}>
                <span className={styles.dayCellToday}>21 HOY</span>
                <span style={{ color: 'var(--emerald)', fontSize: '9px' }}>●</span>
              </div>
              <div className={styles.eventBadgeStudy}>📖 Estudio 18:00 hs</div>
            </div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>22</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>23</span></div></div>
            <div
              className={`${styles.dayCell} ${selectedEventId === 'evt-1' ? styles.dayCellSelected : ''}`}
              style={{ borderLeft: '2px solid var(--red)' }}
              onClick={() => setSelectedEventId('evt-1')}
            >
              <div className={styles.dayCellHeader}>
                <span style={{ color: 'var(--red)', fontWeight: 700 }}>24 !</span>
                <span style={{ background: 'var(--red-alpha)', color: 'var(--red)', padding: '0 4px', borderRadius: '2px' }}>40%</span>
              </div>
              <div className={styles.eventBadgeExam}>★ 1° Parcial 09:00</div>
            </div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>25</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>26</span></div></div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>27</span></div></div>

            {/* Week 5: 28 Apr to 04 May */}
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>28</span></div></div>
            <div className={`${styles.dayCell} ${selectedEventId === 'evt-2' ? styles.dayCellSelected : ''}`} onClick={() => setSelectedEventId('evt-2')}>
              <div className={styles.dayCellHeader}>
                <span>29</span>
                <span style={{ color: 'var(--purple)', fontSize: '9px' }}>●</span>
              </div>
              <div className={styles.eventBadgeTP}>TP Entrega BD II</div>
            </div>
            <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>30</span></div></div>
            <div className={`${styles.dayCell} ${styles.dayCellOutside}`}><div className={styles.dayCellHeader}><span>01 Feriado</span></div></div>
            <div className={`${styles.dayCell} ${styles.dayCellOutside}`}><div className={styles.dayCellHeader}><span>02</span></div></div>
            <div className={`${styles.dayCell} ${styles.dayCellOutside}`}><div className={styles.dayCellHeader}><span>03</span></div></div>
            <div className={`${styles.dayCell} ${styles.dayCellOutside}`}><div className={styles.dayCellHeader}><span>04</span></div></div>
          </div>
        </div>

        {/* Right Detail Sidebar */}
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
              <div className={styles.upcomingItem} onClick={() => setSelectedEventId('evt-3')}>
                <div className={styles.upcomingLeft}>
                  <span className={styles.upcomingTitle}>Sesión Estudio Raft</span>
                  <span className={styles.upcomingMeta}>Hoy 18:00 - 20:00 hs</span>
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--emerald)', background: 'var(--emerald-alpha)', padding: '2px 5px', borderRadius: '2px' }}>
                  ESTUDIO
                </span>
              </div>

              <div className={styles.upcomingItem} onClick={() => setSelectedEventId('evt-1')}>
                <div className={styles.upcomingLeft}>
                  <span className={styles.upcomingTitle}>1° Parcial Distribuidos</span>
                  <span className={styles.upcomingMeta}>Jue 24 · 09:00 hs (Aula 302)</span>
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--red)', background: 'var(--red-alpha)', padding: '2px 5px', borderRadius: '2px' }}>
                  PARCIAL
                </span>
              </div>

              <div className={styles.upcomingItem} onClick={() => setSelectedEventId('evt-2')}>
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
      </div>
    </div>
  );
};
