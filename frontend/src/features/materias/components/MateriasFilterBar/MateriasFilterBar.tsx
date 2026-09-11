import React from 'react';
import styles from './MateriasFilterBar.module.css';
import { Search } from 'lucide-react';
import type { Materia } from '../../../../types/academic';
import { useMaterias } from '../../../../hooks';
import { useAuth } from '../../../../context/AuthContext';

interface MateriasFilterBarProps {
  selectedYear: number | 'TODOS';
  onSelectYear: (year: number | 'TODOS') => void;
  selectedCuatri: 'TODOS' | '1C' | '2C' | 'Anual';
  onSelectCuatri: (cuatri: 'TODOS' | '1C' | '2C' | 'Anual') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedEstado: string;
  onSelectEstado: (estado: string) => void;
  materias?: Materia[];
}

export const MateriasFilterBar: React.FC<MateriasFilterBarProps> = ({
  selectedYear,
  onSelectYear,
  selectedCuatri,
  onSelectCuatri,
  searchQuery,
  onSearchChange,
  selectedEstado,
  onSelectEstado,
  materias: propMaterias
}) => {
  const { activeCarrera } = useAuth();
  const { materias: hookMaterias } = useMaterias();
  const currentMaterias = propMaterias || hookMaterias;

  const maxYear = Math.max(
    activeCarrera?.duracion_anios || 5,
    ...currentMaterias.map(m => m.anio || 1),
    1
  );
  const yearsList = Array.from({ length: maxYear }, (_, i) => i + 1);

  return (
    <div className={styles.filtersBar}>
      <div className={styles.filtersLeft}>
        {/* Year Pills (Dinámicos según duración de carrera y Todos) */}
        <div className={styles.pillGroup}>
          <button
            className={`${styles.pillBtn} ${selectedYear === 'TODOS' ? styles.pillBtnActive : ''}`}
            onClick={() => onSelectYear('TODOS')}
            title="Todos los años"
          >
            Todos
          </button>
          {yearsList.map(yr => (
            <button
              key={yr}
              className={`${styles.pillBtn} ${selectedYear === yr ? styles.pillBtnActive : ''}`}
              onClick={() => onSelectYear(yr)}
            >
              {yr}°
            </button>
          ))}
        </div>

        {/* Cuatrimestre Pills (1C, 2C, Anual y Todos) */}
        <div className={styles.pillGroup}>
          <button
            className={`${styles.pillBtn} ${selectedCuatri === 'TODOS' ? styles.pillBtnActive : ''}`}
            onClick={() => onSelectCuatri('TODOS')}
          >
            Todos
          </button>
          {(['1C', '2C', 'Anual'] as const).map(c => (
            <button
              key={c}
              className={`${styles.pillBtn} ${selectedCuatri === c ? styles.pillBtnActive : ''}`}
              onClick={() => onSelectCuatri(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className={styles.searchInputWrapper}>
          <Search size={13} />
          <input
            type="text"
            placeholder="Filtrar por código o nombre..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className={styles.statusTabs}>
        <span className={styles.statusFilterLabel}>ESTADO:</span>
        {['TODOS', 'CURSANDO', 'REGULAR', 'APROBADA', 'PROMOCIONADA'].map(st => {
          const count = st === 'TODOS'
            ? currentMaterias.length
            : currentMaterias.filter(m => m.estado === st).length;
          const label = st === 'TODOS' ? 'Todos' : st.charAt(0) + st.slice(1).toLowerCase();
          return (
            <button
              key={st}
              className={`${styles.statusTabBtn} ${selectedEstado === st ? styles.statusTabBtnActive : ''}`}
              onClick={() => onSelectEstado(st)}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MateriasFilterBar;
