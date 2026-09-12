import React, { useEffect } from "react";
import styles from "./MallaFocusBar.module.css";
import type { MateriaNodeData } from "../../../../types/malla";
import { Sparkles, ExternalLink, X, Minimize2, Maximize2 } from "lucide-react";

interface MallaFocusBarProps {
  nodeData: MateriaNodeData;
  isFocusMode: boolean;
  upstreamCount: number;
  downstreamCount: number;
  onToggleFocusMode: () => void;
  onOpenDrawer: () => void;
  onClearSelection: () => void;
}

export const MallaFocusBar: React.FC<MallaFocusBarProps> = ({
  nodeData,
  isFocusMode,
  upstreamCount,
  downstreamCount,
  onToggleFocusMode,
  onOpenDrawer,
  onClearSelection,
}) => {
  const { materia } = nodeData;

  // Esc keyboard shortcut to close focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClearSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClearSelection]);

  return (
    <div className={styles.focusBarContainer}>
      <div className={styles.leftInfo}>
        <span className={styles.focusBadge}>
          <Sparkles size={11} />
          <span>Enfoque</span>
        </span>
        <div
          className={styles.materiaTitle}
          title={`${materia.nombre} (${materia.codigo})`}
        >
          {materia.nombre}
          <span className={styles.materiaCode}>[{materia.codigo}]</span>
        </div>
      </div>

      <div className={styles.centerStats}>
        <span
          className={`${styles.statPill} ${styles.statPillAmber}`}
          title="Materias correlativas requeridas para cursar o rendir esta materia"
        >
          <span>{upstreamCount}</span>
          <span>
            {upstreamCount === 1 ? "previa requerida" : "previas requeridas"}
          </span>
        </span>

        <span
          className={`${styles.statPill} ${styles.statPillEmerald}`}
          title="Materias que podrás cursar o rendir al aprobar esta materia"
        >
          <span>{downstreamCount}</span>
          <span>{downstreamCount === 1 ? "desbloquea" : "desbloquea"}</span>
        </span>
      </div>

      <div className={styles.rightActions}>
        {/* Toggle proximity / full grid */}
        <button
          type="button"
          className={`${styles.btnAction} ${isFocusMode ? styles.btnActionActive : ""}`}
          onClick={onToggleFocusMode}
          title={
            isFocusMode
              ? "Ver todas las columnas de la malla completa"
              : "Acercar las correlativas ocultando materias no relacionadas"
          }
        >
          {isFocusMode ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          <span>
            {isFocusMode ? "Correlativas Cercanas" : "Malla Completa"}
          </span>
        </button>

        {/* View full subject diagnosis drawer */}
        <button
          type="button"
          className={styles.btnAction}
          onClick={onOpenDrawer}
          title="Abrir panel con diagnóstico completo y reglas de acreditación"
        >
          <ExternalLink size={12} />
          <span>Diagnóstico</span>
        </button>

        {/* Close focus mode */}
        <button
          type="button"
          className={styles.btnClose}
          onClick={onClearSelection}
          title="Volver a la vista general (Esc)"
        >
          <X size={13} />
          <span>Cerrar</span>
        </button>
      </div>
    </div>
  );
};
