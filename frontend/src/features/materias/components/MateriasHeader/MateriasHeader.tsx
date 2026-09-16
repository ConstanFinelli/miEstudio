import React from "react";
import styles from "./MateriasHeader.module.css";
import { Plus, Network, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MateriasHeaderProps {
  onRegisterMateria?: () => void;
  onImportPlan?: () => void;
}

export const MateriasHeader: React.FC<MateriasHeaderProps> = ({
  onRegisterMateria,
  onImportPlan,
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.headerArea}>
      <div className={styles.headerLeft}>
        <div className={styles.headerMeta}>
          <span>GESTIÓN DE CURSADAS</span>
          <span>·</span>
          <span>PLAN DE ESTUDIO</span>
          <span>·</span>
          <span className={styles.headerMetaDim}>
            SEGUIMIENTO ACADÉMICO
          </span>
        </div>

        <div className={styles.headerTitleRow}>
          <h1 className={styles.pageTitle}>Materias & Cursadas</h1>
          <span className={styles.consoleBadge}>CONSOLA ACADÉMICA</span>
        </div>

        <p className={styles.pageDesc}>
          Seguimiento de instancias de examen, ponderación y proyección de
          regularidad y acreditación.
        </p>
      </div>

      <div className={styles.headerRight}>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => navigate("/plan-de-estudio")}
          title="Ver mapa interactivo de correlatividades y proyección"
        >
          <Network size={14} />
          <span>Plan de Estudio</span>
        </button>

        {onImportPlan && (
          <button
            type="button"
            className={styles.btnSecondary}
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))",
              borderColor: "rgba(168, 85, 247, 0.35)",
              color: "#c084fc",
            }}
            onClick={onImportPlan}
            title="Importar y digitalizar plan de estudio completo con IA"
          >
            <Sparkles size={14} />
            <span>Importar con IA</span>
          </button>
        )}

        {onRegisterMateria && (
          <button className={styles.btnPrimary} onClick={onRegisterMateria}>
            <Plus size={14} />
            <span>Registrar Materia</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MateriasHeader;
