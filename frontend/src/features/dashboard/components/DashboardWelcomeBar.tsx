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

  const displayName = perfil.nombre === 'Estudiante' ? 'a tu Espacio de Estudio' : perfil.nombre.split(" ")[0];
  const greeting = perfil.nombre === 'Estudiante' ? `Bienvenido ${displayName}` : `Hola de nuevo, ${displayName}`;

  return (
    <div className={styles.welcomeSection}>
      <div className={styles.welcomeLeft}>
        <div className={styles.titleRow}>
          <h1 className={styles.welcomeTitle}>
            {greeting}
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
        {perfil.creditosTotales > 0 ? (
          <div className={`${styles.filterPill} ${styles.filterPillSuccess}`}>
            <CheckCircle2 size={13} />
            <span>
              {perfil.creditosAprobados} / {perfil.creditosTotales} CR
            </span>
          </div>
        ) : (
          <div className={styles.filterPill}>
            <span>Ciclo Académico Activo</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardWelcomeBar;
