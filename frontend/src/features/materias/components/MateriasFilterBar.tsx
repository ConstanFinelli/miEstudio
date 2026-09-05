import React from 'react';
import styles from '../MateriasView.module.css';
import { Search } from 'lucide-react';
import type { Materia } from '../../../types/academic';
import { useMaterias } from '../../../hooks';

interface MateriasFilterBarProps {
  selectedYear: number;
  onSelectYear: (year: number) => void;
  selectedCuatri: '1C' | '2C' | 'Anual';
  onSelectCuatri: (cuatri: '1C' | '2C' | 'Anual') => void;
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
  const { materias: hookMaterias } = useMaterias();
  const currentMaterias = propMaterias || hookMaterias;
  return (
    <div className={styles.filtersBar}>
      <div className={styles.filtersLeft}>
        {/* Year Pills */}
        <div className={styles.pillGroup}>
          {[1, 2, 3, 4].map(yr => (
            <button
              key={yr}
              className={`${styles.pillBtn} ${selectedYear === yr ? styles.pillBtnActive : ''}`}
              onClick={() => onSelectYear(yr)}
            >
              {yr}° Año
            </button>
          ))}
        </div>

        {/* Cuatrimestre */}
        <div className={styles.pillGroup}>
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
        <span style={{ color: 'var(--text-dim)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>ESTADO:</span>
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
