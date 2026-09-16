import React, { useState, useMemo } from 'react';
import styles from './UpcomingEvaluations.module.css';
import { CalendarClock, ArrowRight, GraduationCap } from 'lucide-react';
import { useEvaluaciones, useMaterias } from '../../../../hooks';
import { useAuth } from '../../../../context/AuthContext';

interface UpcomingEvaluationsProps {
  onGoToMaterias: (materiaId?: string, carreraId?: string) => void;
  onGoToApuntes: () => void;
}

export const UpcomingEvaluations: React.FC<UpcomingEvaluationsProps> = ({
  onGoToMaterias,
  onGoToApuntes: _onGoToApuntes
}) => {
  const { proximas } = useEvaluaciones();
  const { materias } = useMaterias(undefined, undefined, 'ALL');
  const { activeCarrera, carreras, selectCarrera } = useAuth();
  const [carreraFilter, setCarreraFilter] = useState<'ALL' | 'ACTIVE'>('ALL');

  const handleGoToMateria = async (materiaId: string, carreraId?: string) => {
    if (carreraId && activeCarrera?.id !== carreraId) {
      try {
        await selectCarrera(carreraId);
      } catch (err) {
        console.error('Error al cambiar de carrera:', err);
      }
    }
    onGoToMaterias(materiaId, carreraId);
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const pendingProximas = useMemo(() => {
    return proximas.filter(
      (ev): ev is typeof ev & { fecha: string } => {
        if (ev.nota !== null && ev.nota !== undefined) return false;
        if (!ev.fecha) return false;
        // Solo mostrar eventos cuya fecha sea igual o posterior al inicio de hoy
        const evDate = new Date(ev.fecha).getTime();
        return evDate >= todayStart;
      }
    );
  }, [proximas, todayStart]);

  const filteredProximas = useMemo(() => {
    if (carreraFilter === 'ALL' || !activeCarrera?.id) {
      return pendingProximas;
    }
    return pendingProximas.filter((ev) => {
      const matchedMateria = materias.find(m => m.id === ev.materiaId);
      const evCarreraId = ev.carreraId || matchedMateria?.carreraId;
      return evCarreraId === activeCarrera.id;
    });
  }, [pendingProximas, carreraFilter, activeCarrera, materias]);

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
      const n = new Date();
      const tStart = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
      const target = new Date(dateStr);
      const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
      const diffDays = Math.round((targetDay - tStart) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return 'Hoy';
      if (diffDays === 1) return 'Mañana';
      return `En ${diffDays} días`;
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
        <div className={styles.headerActions}>
          {activeCarrera && (
            <div className={styles.carreraFilterToggle}>
              <button
                type="button"
                className={`${styles.filterPill} ${carreraFilter === 'ALL' ? styles.filterPillActive : ''}`}
                onClick={() => setCarreraFilter('ALL')}
              >
                Todas las carreras
              </button>
              <button
                type="button"
                className={`${styles.filterPill} ${carreraFilter === 'ACTIVE' ? styles.filterPillActive : ''}`}
                onClick={() => setCarreraFilter('ACTIVE')}
                title={`Filtrar por ${activeCarrera.nombre}`}
              >
                <GraduationCap size={12} />
                <span>{activeCarrera.nombre}</span>
              </button>
            </div>
          )}
          <span className={styles.sectionScopeBadge}>Ventana: 30 Días</span>
        </div>
      </div>

      {filteredProximas.length === 0 ? (
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
            {carreraFilter === 'ACTIVE' && activeCarrera
              ? `Sin evaluaciones pendientes para ${activeCarrera.nombre}`
              : 'Sin evaluaciones pendientes'}
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {carreraFilter === 'ACTIVE' && pendingProximas.length > 0 ? (
              <span>
                Hay {pendingProximas.length} evaluación(es) en otras carreras.{' '}
                <button
                  type="button"
                  onClick={() => setCarreraFilter('ALL')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-glow)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontSize: '12px'
                  }}
                >
                  Ver todas
                </button>
              </span>
            ) : (
              'Estás al día con tus cursadas. Usa el botón superior para registrar un nuevo examen o entrega.'
            )}
          </p>
        </div>
      ) : (
        filteredProximas.slice(0, 3).map((ev, index) => {
          const isUrgent = index === 0;
          const matchedMateria = materias.find(m => m.id === ev.materiaId);
          const codigo = matchedMateria?.codigo || (ev.materiaCodigo !== 'MAT' ? ev.materiaCodigo : '') || 'EXAM';
          const nombre = matchedMateria?.nombre || (ev.materiaNombre !== 'Materia' ? ev.materiaNombre : '') || 'Materia';
          const evCarreraId = ev.carreraId || matchedMateria?.carreraId;
          const carreraObj = carreras.find(c => c.id === evCarreraId);
          const carreraNombre = carreraObj?.nombre;

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
                  <span className={styles.badgeCode}>Código: {codigo}</span>
                  {carreraFilter === 'ALL' && carreraNombre && carreras.length > 1 && (
                    <span className={styles.badgeCarrera} title={carreraNombre}>
                      <GraduationCap size={10} />
                      {carreraNombre}
                    </span>
                  )}
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
                  <span
                    style={{ color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}
                    onClick={() => handleGoToMateria(ev.materiaId, evCarreraId)}
                    title={`Ver materia ${nombre}`}
                  >
                    {nombre}
                  </span>
                  {ev.esAprobatorio && (
                    <>
                      <span>·</span>
                      <span style={{ color: 'var(--amber)', fontSize: '11px', fontWeight: 600 }}>
                        Aprobatorio
                      </span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.evalActionLink}
                  onClick={() => handleGoToMateria(ev.materiaId, evCarreraId)}
                  title={`Ver materia ${nombre}`}
                >
                  <span>Ver materia</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default UpcomingEvaluations;
