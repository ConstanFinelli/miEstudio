import React from "react";
import styles from "../DashboardView.module.css";
import { CheckCircle2 } from "lucide-react";
import type { PerfilEstudiante } from "../../../types/academic";
import { usePerfil } from "../../../hooks";

interface DashboardWelcomeBarProps {
  perfil?: PerfilEstudiante | null;
}

export const DashboardWelcomeBar: React.FC<DashboardWelcomeBarProps> = ({ perfil: propPerfil }) => {
  const { perfil: hookPerfil } = usePerfil();
  const perfil = propPerfil || hookPerfil;

  if (!perfil) return null;

  return (
    <div className={styles.welcomeSection}>
      <div className={styles.welcomeLeft}>
        <div className={styles.titleRow}>
          <h1 className={styles.welcomeTitle}>
            Hola de nuevo, {perfil.nombre.split(" ")[0]}
          </h1>
          <span className={styles.semesterPill}>
            {perfil.semestreActual}
          </span>
        </div>
      </div>

      <div className={styles.welcomeRight}>
        <button className={`${styles.filterPill} ${styles.filterPillActive}`}>
          Historial de Cursadas
        </button>
        <div className={`${styles.filterPill} ${styles.filterPillSuccess}`}>
          <CheckCircle2 size={13} />
          <span>
            {perfil.creditosAprobados} / {perfil.creditosTotales} CR
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardWelcomeBar;
