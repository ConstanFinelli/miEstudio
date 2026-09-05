import React from 'react';
import styles from '../MateriasView.module.css';
import { Plus } from 'lucide-react';

interface MateriasHeaderProps {
  onRegisterMateria?: () => void;
  totalCreditos?: number;
}

export const MateriasHeader: React.FC<MateriasHeaderProps> = ({
  onRegisterMateria,
  totalCreditos
}) => {
  return (
    <div className={styles.headerArea}>
      <div className={styles.headerLeft}>
        <div className={styles.headerMeta}>
          <span>GESTIÓN DE CURSADAS</span>
          <span>·</span>
          <span>PLAN DE ESTUDIO</span>
          <span>·</span>
          <span style={{ color: 'var(--text-dim)' }}>SEGUIMIENTO ACADÉMICO</span>
        </div>

        <div className={styles.headerTitleRow}>
          <h1 className={styles.pageTitle}>Materias & Cursadas</h1>
          <span className={styles.consoleBadge}>CONSOLA ACADÉMICA</span>
        </div>

        <p className={styles.pageDesc}>
          Control de correlatividades, ponderación por instancia de examen y proyección de regularidad y promoción directa.
        </p>
      </div>

      <div className={styles.headerRight}>
        {totalCreditos !== undefined && (
          <div className={styles.creditsKpi}>
            <span style={{ color: 'var(--emerald)' }}>●</span>
            <span>Créditos en curso:</span>
            <span className={styles.creditsKpiVal}>{totalCreditos} UCA</span>
          </div>
        )}

        {onRegisterMateria && (
          <button className={styles.btnPrimary} onClick={onRegisterMateria}>
            <Plus size={14} />
            <span>+ Registrar Materia</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MateriasHeader;
