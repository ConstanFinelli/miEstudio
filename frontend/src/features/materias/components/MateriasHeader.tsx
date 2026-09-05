import React from 'react';
import styles from '../MateriasView.module.css';
import { Plus } from 'lucide-react';

interface MateriasHeaderProps {
  onRegisterMateria?: () => void;
}

export const MateriasHeader: React.FC<MateriasHeaderProps> = ({
  onRegisterMateria = () => alert('Registrar nueva materia')
}) => {
  return (
    <div className={styles.headerArea}>
      <div className={styles.headerLeft}>
        <div className={styles.headerMeta}>
          <span>GESTIÓN DE CURSADAS</span>
          <span>·</span>
          <span>INGENIERÍA EN SISTEMAS DE INFORMACIÓN</span>
          <span>·</span>
          <span style={{ color: 'var(--text-dim)' }}>PLAN 2023</span>
        </div>

        <div className={styles.headerTitleRow}>
          <h1 className={styles.pageTitle}>Materias & Cursadas</h1>
          <span className={styles.consoleBadge}>RF1 + RF2 CONSOLE</span>
        </div>

        <p className={styles.pageDesc}>
          Control estricto de correlatividades, ponderación ponderada por instancia de examen y proyección algorítmica de regularidad y promoción directa.
        </p>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.creditsKpi}>
          <span style={{ color: 'var(--emerald)' }}>●</span>
          <span>Créditos en curso:</span>
          <span className={styles.creditsKpiVal}>24 UCA</span>
        </div>

        <button className={styles.btnPrimary} onClick={onRegisterMateria}>
          <Plus size={14} />
          <span>+ Registrar Materia</span>
        </button>
      </div>
    </div>
  );
};

export default MateriasHeader;
