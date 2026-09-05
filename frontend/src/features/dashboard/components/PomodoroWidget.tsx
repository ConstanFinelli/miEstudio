import React, { useState } from 'react';
import styles from '../DashboardView.module.css';
import { Clock, Play } from 'lucide-react';

interface PomodoroWidgetProps {
  onStartPomodoro: () => void;
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({ onStartPomodoro }) => {
  const [tasks, setTasks] = useState([
    { id: 't1', text: 'Revisión de slides: Leader Election', completed: true },
    { id: 't2', text: 'Releer paper Diego Ongaro (Capítulo 5)', completed: true },
    { id: 't3', text: 'Resolver ejercicio parcial 2024 (Split-brain)', completed: false },
    { id: 't4', text: 'Diagramar máquinas de estado concurrentes', completed: false }
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
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
  );
};

export default PomodoroWidget;
