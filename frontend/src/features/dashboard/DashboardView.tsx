import React, { useState } from 'react';
import styles from './DashboardView.module.css';
import {
  CalendarClock,
  Clock,
  Layers,
  GraduationCap,
  Calculator,
  Flame,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Play,
  TrendingUp
} from 'lucide-react';
import { mockPerfil } from '../../data/mockData';

interface DashboardViewProps {
  onNavigate: (view: 'dashboard' | 'materias' | 'calendario' | 'apuntes') => void;
  onOpenEvaluationModal: () => void;
  onOpenNoteModal: () => void;
  onStartPomodoro: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenEvaluationModal,
  onOpenNoteModal,
  onStartPomodoro
}) => {
  const [tasks, setTasks] = useState([
    { id: 't1', text: 'Revisión de slides: Leader Election', completed: true },
    { id: 't2', text: 'Releer paper Diego Ongaro (Capítulo 5)', completed: true },
    { id: 't3', text: 'Resolver ejercicio parcial 2024 (Split-brain)', completed: false },
    { id: 't4', text: 'Diagramar máquinas de estado concurrentes', completed: false }
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className={styles.container}>
      {/* Welcome / SIU Sync Bar */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeLeft}>
          <div className={styles.syncIndicator}>
            <span className={styles.syncDot} />
            <span>SINCRONIZADO CON SIU GUARANÍ</span>
          </div>
          <div className={styles.titleRow}>
            <h1 className={styles.welcomeTitle}>Hola de nuevo, {mockPerfil.nombre.split(' ')[0]}</h1>
            <span className={styles.semesterPill}>{mockPerfil.semestreActual}</span>
          </div>
        </div>

        <div className={styles.welcomeRight}>
          <button className={`${styles.filterPill} ${styles.filterPillActive}`}>
            Historial de Cursadas
          </button>
          <div className={`${styles.filterPill} ${styles.filterPillSuccess}`}>
            <CheckCircle2 size={13} />
            <span>{mockPerfil.creditosAprobados} / {mockPerfil.creditosTotales} CR</span>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className={styles.kpiGrid}>
        {/* KPI 1: Promedio General */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiTitleGroup}>
              <span className={styles.kpiLabel}>Promedio General</span>
              <span className={styles.kpiSub}>Escala oficial (1 - 10)</span>
            </div>
            <div className={styles.kpiIconBox}>
              <Calculator size={15} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue}>{mockPerfil.promedioGeneral.toFixed(2)}</span>
            <span className={styles.kpiSubValue}>/ 10.0</span>
            <span className={styles.deltaBadge}>
              <TrendingUp size={11} />
              +{mockPerfil.deltaPromedio} vs 2024-2C
            </span>
          </div>
          <div className={styles.kpiFooter}>
            <span>Puesto: #{mockPerfil.puestoCohorte} en cohorte</span>
            <span>Percentil {mockPerfil.percentil}%</span>
          </div>
        </div>

        {/* KPI 2: Progreso de Carrera */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiTitleGroup}>
              <span className={styles.kpiLabel}>Progreso de Carrera</span>
              <span className={styles.kpiSub}>
                {mockPerfil.materiasAprobadas} de {mockPerfil.materiasTotales} materias aprobadas
              </span>
            </div>
            <div className={styles.kpiIconBox}>
              <GraduationCap size={15} />
            </div>
          </div>
          <div>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiMainValue}>
                {Math.round((mockPerfil.materiasAprobadas / mockPerfil.materiasTotales) * 100)}%
              </span>
              <span className={styles.kpiSubValue}>
                {mockPerfil.materiasTotales - mockPerfil.materiasAprobadas} pendientes
              </span>
            </div>
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${(mockPerfil.materiasAprobadas / mockPerfil.materiasTotales) * 100}%` }}
              />
            </div>
          </div>
          <div className={styles.kpiFooter}>
            <span>Tesina habilitada al 75%</span>
            <span>Faltan 5 materias</span>
          </div>
        </div>

        {/* KPI 3: Materias en Curso */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiTitleGroup}>
              <span className={styles.kpiLabel}>Materias en Curso</span>
              <span className={styles.kpiSub}>En curso regular</span>
            </div>
            <div className={styles.kpiIconBox}>
              <Layers size={15} />
            </div>
          </div>
          <div>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiMainValue}>4</span>
              <span style={{ fontSize: '12px', color: 'var(--emerald)' }}>Todas regulares al día</span>
            </div>
            <div className={styles.subjectPills}>
              <span className={styles.subjectMiniPill}>SD</span>
              <span className={styles.subjectMiniPill}>BD-II</span>
              <span className={styles.subjectMiniPill}>ALGO-3</span>
              <span className={styles.subjectMiniPill}>REDES</span>
            </div>
          </div>
          <div className={styles.kpiFooter}>
            <span>Carga semanal: 24 hs</span>
            <span style={{ cursor: 'pointer', color: 'var(--primary-glow)' }} onClick={() => onNavigate('materias')}>
              Ver detalle →
            </span>
          </div>
        </div>

        {/* KPI 4: Atención Inmediata */}
        <div className={styles.kpiCard} style={{ borderLeft: '3px solid var(--red)' }}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiTitleGroup}>
              <span className={styles.kpiLabel} style={{ color: 'var(--red)' }}>Atención Inmediata</span>
              <span className={styles.kpiSub}>Ventana crítica de 7 días</span>
            </div>
            <div className={styles.kpiIconBox} style={{ color: 'var(--red)' }}>
              <Flame size={15} />
            </div>
          </div>
          <div>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiMainValue} style={{ color: 'var(--red)' }}>2</span>
              <span className={styles.kpiSubValue}>Exámenes</span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>En 3 y 8 días</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>
              Sistemas Distribuidos (40% nota)
            </div>
          </div>
          <div className={styles.kpiFooter}>
            <span style={{ color: 'var(--text-muted)' }}>Requiere repaso intensivo</span>
            <span
              style={{ cursor: 'pointer', color: 'var(--primary-glow)' }}
              onClick={() => onNavigate('calendario')}
            >
              Ver fechas →
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className={styles.dashboardSplit}>
        {/* Left Column: Próximas Evaluaciones + Curva */}
        <div className={styles.leftColumn}>
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
              <button className={styles.evalActionLink} onClick={() => onNavigate('materias')}>
                <span>Ver simulacro de examen</span>
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
              <button className={styles.evalActionLink} onClick={() => onNavigate('apuntes')}>
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

          {/* Calendario Banner */}
          <div className={styles.scheduleBanner} onClick={() => onNavigate('calendario')}>
            <div className={styles.scheduleBannerLeft}>
              <CalendarClock size={16} color="var(--primary-glow)" />
              <span>Ver cronograma completo de exámenes del cuatrimestre (12 eventos restantes)</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--primary-glow)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Ver calendario completo <ArrowRight size={13} />
            </span>
          </div>

          {/* Evolución Promedio Ponderado Sparkline */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  EVOLUCIÓN DE PROMEDIO PONDERADO
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Curva histórica de calificaciones por cuatrimestre
                </div>
              </div>
              <div className={styles.chartTrend}>
                <TrendingUp size={14} />
                <span>Tendencia positiva</span>
              </div>
            </div>

            <div className={styles.chartSvgWrapper}>
              <svg width="100%" height="100%" viewBox="0 0 500 70" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 20 55 Q 120 48, 200 40 T 350 25 T 480 15 L 480 70 L 20 70 Z"
                  fill="url(#curveGrad)"
                />
                <path
                  d="M 20 55 Q 120 48, 200 40 T 350 25 T 480 15"
                  fill="none"
                  stroke="#c0c1ff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="55" r="3.5" fill="#818cf8" />
                <circle cx="135" cy="46" r="3.5" fill="#818cf8" />
                <circle cx="250" cy="35" r="3.5" fill="#818cf8" />
                <circle cx="365" cy="24" r="3.5" fill="#818cf8" />
                <circle cx="480" cy="15" r="4.5" fill="#ffffff" stroke="#6366f1" strokeWidth="2" />
              </svg>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
              <span>2022-1C (7.2)</span>
              <span>2022-2C (7.6)</span>
              <span>2023-1C (7.9)</span>
              <span>2024-1C (8.1)</span>
              <span style={{ color: 'var(--emerald)', fontWeight: '600' }}>2025-1C (8.42)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sesión Pomodoro + Notas Recientes + Atajos */}
        <div className={styles.rightColumn}>
          {/* Pomodoro Widget */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetTitle}>
                <Clock size={13} color="var(--emerald)" />
                <span>SESIÓN PLANIFICADA</span>
              </div>
              <span className={styles.widgetPill}>Hoy · 18:00 hs</span>
            </div>

            <div>
              <h4 className={styles.sessionTitle}>Repaso Intensivo: Raft & RPC</h4>
              <p className={styles.sessionDesc}>
                Bloque de estudio concentrado de 2 horas con técnica Pomodoro (4 x 25m).
              </p>
            </div>

            <div className={styles.taskList}>
              {tasks.map(t => (
                <label key={t.id} className={styles.taskItem}>
                  <input
                    type="checkbox"
                    className={styles.taskCheckbox}
                    checked={t.completed}
                    onChange={() => toggleTask(t.id)}
                  />
                  <span className={t.completed ? styles.taskCompleted : ''}>
                    {t.text}
                  </span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {completedCount} de {tasks.length} tareas listas
              </span>
              <button className={styles.pomodoroBtn} onClick={onStartPomodoro}>
                <Play size={12} fill="white" />
                <span>Iniciar Pomodoro</span>
              </button>
            </div>
          </div>

          {/* Notas Recientes */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetTitle}>
                <BookOpen size={13} />
                <span>NOTAS RECIENTES</span>
              </div>
              <button
                style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}
                onClick={() => onNavigate('apuntes')}
              >
                <span>Ver todas</span>
                <ExternalLink size={11} />
              </button>
            </div>

            <div className={styles.recentNotesList}>
              <div className={styles.recentNoteItem} onClick={() => onNavigate('apuntes')}>
                <div className={styles.recentNoteMeta}>
                  <span className={styles.recentNoteSubject}>SISTEMAS DISTRIBUIDOS</span>
                  <span className={styles.recentNoteDate}>Editado hace 2h</span>
                </div>
                <div className={styles.recentNoteTitle}>Glosario: Sharding, Replicación y Teorema CAP</div>
                <div className={styles.recentNoteExcerpt}>
                  Diferencias prácticas entre consistencia secuencial, causal y eventual...
                </div>
              </div>

              <div className={styles.recentNoteItem} onClick={() => onNavigate('apuntes')}>
                <div className={styles.recentNoteMeta}>
                  <span className={styles.recentNoteSubject} style={{ color: 'var(--blue)' }}>BASES DE DATOS II</span>
                  <span className={styles.recentNoteDate}>Ayer, 21:30</span>
                </div>
                <div className={styles.recentNoteTitle}>Árboles B+ y Optimización de Consultas SQL</div>
                <div className={styles.recentNoteExcerpt}>
                  Análisis de planes con EXPLAIN ANALYZE. Costos de I/O y buffer pool...
                </div>
              </div>

              <div className={styles.recentNoteItem} onClick={() => onNavigate('apuntes')}>
                <div className={styles.recentNoteMeta}>
                  <span className={styles.recentNoteSubject} style={{ color: 'var(--purple)' }}>REDES DE DATOS</span>
                  <span className={styles.recentNoteDate}>18 Abr</span>
                </div>
                <div className={styles.recentNoteTitle}>Control de Congestión en TCP: Tahoe vs Reno vs BBR</div>
                <div className={styles.recentNoteExcerpt}>
                  Ventanas de congestión (cwnd), Slow Start y mecanismos de retransmisión...
                </div>
              </div>
            </div>
          </div>

          {/* Atajos Rápidos */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetTitle}>
                <span>ATAJOS RÁPIDOS</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Keyboard First
              </span>
            </div>

            <div className={styles.shortcutsGrid}>
              <button className={styles.shortcutItem} onClick={onOpenNoteModal}>
                <span>Nuevo apunte</span>
                <span className={styles.shortcutKbd}>⌘ N</span>
              </button>

              <button className={styles.shortcutItem} onClick={onOpenEvaluationModal}>
                <span>Nueva evaluación</span>
                <span className={styles.shortcutKbd}>⌘ E</span>
              </button>

              <button className={styles.shortcutItem} onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                window.dispatchEvent(event);
              }}>
                <span>Comando global</span>
                <span className={styles.shortcutKbd}>⌘ K</span>
              </button>

              <button className={styles.shortcutItem} onClick={onStartPomodoro}>
                <span>Modo enfoque</span>
                <span className={styles.shortcutKbd}>⌘ P</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
