import React from 'react';
import styles from '../DashboardView.module.css';
import { CheckCircle2 } from 'lucide-react';
import { mockPerfil } from '../../../data/mockData';

export const DashboardWelcomeBar: React.FC = () => {
  return (
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
  );
};

export default DashboardWelcomeBar;
