import React from 'react';
import styles from '../DashboardView.module.css';
import { CalendarClock, ArrowRight } from 'lucide-react';

interface UpcomingEvaluationsProps {
  onGoToMaterias: () => void;
  onGoToApuntes: () => void;
}

export const UpcomingEvaluations: React.FC<UpcomingEvaluationsProps> = ({
  onGoToMaterias,
  onGoToApuntes
}) => {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <CalendarClock size={18} color="var(--primary)" />
          <span>Próximas Instancias de Evaluación</span>
        </div>
        <span className={styles.sectionScopeBadge}>Ventana: 30 Días</span>
      </div>

      {/* Eval 1: Sistemas Distribuidos */}
      <div className={`${styles.evalCard} ${styles.evalCardUrgent}`}>
        <div className={styles.evalCardHeader}>
          <div className={styles.evalBadges}>
            <span className={styles.badgeUrgent}>En 3 días</span>
            <span className={styles.badgeTag}>#Parcial</span>
            <span className={styles.badgeCode}>Código: DIST-701</span>
          </div>
          <div className={styles.evalWeightGroup}>
            <span>Peso: <strong>40%</strong></span>
            <span style={{ color: 'var(--amber)' }}>Estado: Pendiente</span>
          </div>
        </div>

        <div>
          <h3 className={styles.evalTitle}>Parcial 1: Sistemas Distribuidos</h3>
          <p className={styles.evalSub}>
            Jueves 24 de Abril, 19:00 hs · Aula Magna Pabellón 3
          </p>
        </div>

        <div className={styles.temarioRow}>
          <span>Temario:</span>
          <span className={styles.temarioChip}>gRPC & Protocol Buffers</span>
          <span className={styles.temarioChip}>Raft Consensus Algorithm</span>
          <span className={styles.temarioChip}>Relojes Lógicos (Lamport)</span>
        </div>

        <div className={styles.evalFooter}>
          <div className={styles.evalMetrics}>
            <span>Asistencia: <strong className={styles.evalMetricHighlight}>92%</strong></span>
            <span>·</span>
            <span>Guías completadas: <strong className={styles.evalMetricHighlight}>4 / 4</strong></span>
          </div>
          <button className={styles.evalActionLink} onClick={onGoToMaterias}>
            <span>Ver detalles de materia</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Eval 2: Bases de Datos II */}
      <div className={styles.evalCard}>
        <div className={styles.evalCardHeader}>
          <div className={styles.evalBadges}>
            <span className={styles.badgeTag} style={{ color: 'var(--blue)', borderColor: 'var(--blue-border)' }}>
              En 8 días
            </span>
            <span className={styles.badgeTag}>#TrabajoPráctico</span>
            <span className={styles.badgeCode}>Código: BD-502</span>
          </div>
          <div className={styles.evalWeightGroup}>
            <span>Peso: <strong>25%</strong></span>
            <span style={{ color: 'var(--emerald)' }}>En progreso (70%)</span>
          </div>
        </div>

        <div>
          <h3 className={styles.evalTitle}>TP Especial: Motor de Índices y Caché</h3>
          <p className={styles.evalSub}>
            Martes 29 de Abril, 23:59 hs · Entrega GitHub Classroom
          </p>
        </div>

        <div className={styles.temarioRow}>
          <span>Requisitos:</span>
          <span className={styles.temarioChip}>Golang 1.22</span>
          <span className={styles.temarioChip}>PostgreSQL WAL parsing</span>
          <span className={styles.temarioChip}>Benchmarking CPU</span>
        </div>

        <div className={styles.evalFooter}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            repo: <span style={{ color: 'var(--primary-glow)', textDecoration: 'underline' }}>sofiachen/go-bplus-cache</span> ↗
          </div>
          <button className={styles.evalActionLink} onClick={onGoToApuntes}>
            <span>Abrir guía de laboratorio</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
      {/* Eval 3: Algoritmos III */}
      <div className={styles.evalCard}>
        <div className={styles.evalCardHeader}>
          <div className={styles.evalBadges}>
            <span className={styles.badgeTag}>En 24 días</span>
            <span className={styles.badgeTag}>#Parcial</span>
            <span className={styles.badgeCode}>Código: ALG-603</span>
          </div>
          <div className={styles.evalWeightGroup}>
            <span>Peso: <strong>35%</strong></span>
            <span style={{ color: 'var(--text-dim)' }}>Por comenzar</span>
          </div>
        </div>

        <div>
          <h3 className={styles.evalTitle}>Parcial 2: Algoritmos Avanzados y Grafos</h3>
          <p className={styles.evalSub}>
            Jueves 15 de Mayo, 17:00 hs · Laboratorio Turing
          </p>
        </div>

        <div className={styles.temarioRow}>
          <span>Temario:</span>
          <span className={styles.temarioChip}>Flujo Máximo (Ford-Fulkerson)</span>
          <span className={styles.temarioChip}>Programación Lineal</span>
          <span className={styles.temarioChip}>NP-Completitud</span>
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvaluations;
