import React from "react";
import styles from "./DashboardWelcomeBar.module.css";
import type { PerfilEstudiante } from "../../../../types/academic";
import { usePerfil } from "../../../../hooks";
import { useAuth } from "../../../../context/AuthContext";

interface DashboardWelcomeBarProps {
  perfil?: PerfilEstudiante | null;
}

export const DashboardWelcomeBar: React.FC<DashboardWelcomeBarProps> = ({
  perfil: propPerfil,
}) => {
  const { user, activeCarrera } = useAuth();
  const { perfil: hookPerfil } = usePerfil();
  const perfil = propPerfil || hookPerfil;

  const rawNombre = user?.nombre || perfil?.nombre || "Estudiante";

  const displayName =
    !rawNombre || rawNombre === "Estudiante"
      ? "a tu Espacio de Estudio"
      : rawNombre.split(" ")[0];
  const greeting =
    !rawNombre || rawNombre === "Estudiante"
      ? `Bienvenido ${displayName}`
      : `Hola de nuevo, ${displayName}`;

  const pillText = activeCarrera?.nombre || null;

  return (
    <div className={styles.welcomeSection}>
      <div className={styles.welcomeLeft}>
        <div className={styles.titleRow}>
          <h1 className={styles.welcomeTitle}>{greeting}</h1>
          {pillText && <span className={styles.semesterPill}>{pillText}</span>}
        </div>
      </div>
    </div>
  );
};

export default DashboardWelcomeBar;
