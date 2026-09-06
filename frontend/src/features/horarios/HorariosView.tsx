import React, { useState } from 'react';
import styles from './HorariosView.module.css';
import { Clock, Plus, Filter } from 'lucide-react';
import { WeeklyScheduleGrid } from '../calendario/components/WeeklyScheduleGrid';
import { HorarioModal } from '../../components/modals';
import { useHorarios } from '../../hooks';

export const HorariosView: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | 'TODOS'>('TODOS');
  const [selectedCuatri, setSelectedCuatri] = useState<'TODOS' | '1C' | '2C' | 'Anual'>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { refresh } = useHorarios();

  const years: (number | 'TODOS')[] = ['TODOS', 1, 2, 3, 4, 5, 6];
  const cuatris: ('TODOS' | '1C' | '2C' | 'Anual')[] = ['TODOS', '1C', '2C', 'Anual'];

  return (
    <div className={styles.container}>
      {/* 1. View Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.titleRow}>
            <div className={styles.iconSquare}>
              <Clock size={18} />
            </div>
            <h1 className={styles.title}>Horarios de Cursada</h1>
          </div>
          <p className={styles.subtitle}>
            Diagramá tu cronograma semanal de cursada de lunes a viernes con soporte para turnos de distintas facultades, sedes y modalidades.
          </p>
        </div>

        <div className={styles.actionsGroup}>
          <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
            <Plus size={15} />
            <span>+ Nuevo Horario de Cursada</span>
          </button>
        </div>
      </div>

      {/* 2. Filters Row */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>
            <Filter size={11} style={{ display: 'inline', marginRight: 4 }} />
            Año:
          </span>
          <div className={styles.filterPills}>
            {years.map(y => (
              <button
                key={y}
                className={`${styles.pill} ${selectedYear === y ? styles.pillActive : ''}`}
                onClick={() => setSelectedYear(y)}
              >
                {y === 'TODOS' ? 'Todos los Años' : `${y}° Año`}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Cuatrimestre:</span>
          <div className={styles.filterPills}>
            {cuatris.map(c => (
              <button
                key={c}
                className={`${styles.pill} ${selectedCuatri === c ? styles.pillActive : ''}`}
                onClick={() => setSelectedCuatri(c)}
              >
                {c === 'TODOS' ? 'Todos' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Weekly Schedule Grid */}
      <WeeklyScheduleGrid
        filterYear={selectedYear}
        filterCuatri={selectedCuatri}
      />

      {/* Modal for creating a new class schedule */}
      <HorarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
};

export default HorariosView;
