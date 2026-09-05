import React from 'react';
import styles from '../DashboardView.module.css';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { useEvaluaciones } from '../../../hooks';

interface UpcomingEvaluationsProps {
  onGoToMaterias: () => void;
  onGoToApuntes: () => void;
}

export const UpcomingEvaluations: React.FC<UpcomingEvaluationsProps> = ({
  onGoToMaterias,
  onGoToApuntes
}) => {
  const { proximas } = useEvaluaciones();

  const formatDate = (dateStr: string, horario?: string) => {
    try {
      const date = new Date(dateStr);
      const formatted = date.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      const cleanHorario = horario ? (horario.endsWith('hs') ? horario : `${horario} hs`) : '19:00 hs';
      return `${formatted.charAt(0).toUpperCase() + formatted.slice(1)}, ${cleanHorario}`;
    } catch {
      return dateStr;
    }
  };

  const getDaysRemaining = (dateStr: string) => {
    try {
      const diff = new Date(dateStr).getTime() - new Date().getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days <= 0) return 'Hoy / Vencido';
      if (days === 1) return 'En 1 día';
      return `En ${days} días`;
    } catch {
      return 'Próximamente';
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <CalendarClock size={18} color="var(--primary)" />
          <span>Próximas Instancias de Evaluación</span>
        </div>
        <span className={styles.sectionScopeBadge}>Ventana: 30 Días</span>
      </div>

      {proximas.length === 0 ? (
        <div style={{
          padding: '28px 20px',
          textAlign: 'center',
          backgroundColor: 'var(--surface-1)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px'
        }}>
          <CalendarClock size={28} style={{ color: 'var(--emerald)', margin: '0 auto 10px', display: 'block', opacity: 0.8 }} />
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Sin evaluaciones pendientes
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Estás al día con tus cursadas. Usa el botón superior para registrar un nuevo examen o entrega.
          </p>
        </div>
      ) : (
        proximas.slice(0, 3).map((ev, index) => {
        const isUrgent = index === 0;
        return (
          <div
            key={ev.id}
            className={`${styles.evalCard} ${isUrgent ? styles.evalCardUrgent : ''}`}
          >
            <div className={styles.evalCardHeader}>
              <div className={styles.evalBadges}>
                <span className={isUrgent ? styles.badgeUrgent : styles.badgeTag}>
                  {getDaysRemaining(ev.fecha)}
                </span>
                <span className={styles.badgeTag}>#{ev.tipo}</span>
                <span className={styles.badgeCode}>Código: {ev.materiaCodigo}</span>
              </div>
              <div className={styles.evalWeightGroup}>
                <span>Peso: <strong>{ev.peso}%</strong></span>
                <span style={{ color: ev.nota !== null ? 'var(--emerald)' : 'var(--amber)' }}>
                  {ev.nota !== null ? `Nota: ${ev.nota}` : 'Estado: Pendiente'}
                </span>
              </div>
            </div>

            <div>
              <h3 className={styles.evalTitle}>{ev.titulo}</h3>
              <p className={styles.evalSub}>
                {formatDate(ev.fecha, ev.horario)} · {ev.aula} ({ev.modalidad})
              </p>
            </div>

            {ev.temario && ev.temario.length > 0 && (
              <div className={styles.temarioRow}>
                <span>Temario:</span>
                {ev.temario.map((tema, i) => (
                  <span key={i} className={styles.temarioChip}>
                    {tema}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.evalFooter}>
              <div className={styles.evalMetrics}>
                <span>Asistencia: <strong className={styles.evalMetricHighlight}>{ev.asistencia}%</strong></span>
                <span>·</span>
                <span>Guías: <strong className={styles.evalMetricHighlight}>{ev.guiasCompletadas}</strong></span>
              </div>
              <button
                className={styles.evalActionLink}
                onClick={index === 1 ? onGoToApuntes : onGoToMaterias}
              >
                <span>{index === 1 ? 'Abrir guía de estudio' : 'Ver materia'}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        );
      }))}
    </div>
  );
};

export default UpcomingEvaluations;
