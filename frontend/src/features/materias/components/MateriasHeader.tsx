import React from 'react';
import styles from '../MateriasView.module.css';
import { Plus } from 'lucide-react';

interface MateriasHeaderProps {
  onRegisterMateria?: () => void;
}

export const MateriasHeader: React.FC<MateriasHeaderProps> = ({
  onRegisterMateria
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
