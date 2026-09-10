import React from "react";
import styles from "./MateriaNode.module.css";
import type { MateriaNodeData } from "../types";
import {
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  BookOpen,
  FlaskConical,
} from "lucide-react";

interface MateriaNodeProps {
  nodeData: MateriaNodeData;
  isSelected: boolean;
  isFocused: boolean;
  isUpstream: boolean;
  isDownstream: boolean;
  isDimmed: boolean;
  isSimulationActive: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onToggleSimulate: (id: string) => void;
}

export const MateriaNode: React.FC<MateriaNodeProps> = ({
  nodeData,
  isSelected,
  isFocused: _isFocused,
  isUpstream,
  isDownstream,
  isDimmed,
  isSimulationActive,
  onSelect,
  onHover,
  onToggleSimulate,
}) => {
  const { materia, computedStatus, isSimulated } = nodeData;

  const statusClass = (() => {
    switch (computedStatus) {
      case "APROBADA":
        return styles.statusAprobada;
      case "PROMOCIONADA":
        return styles.statusPromocionada;
      case "CURSANDO":
        return styles.statusCursando;
      case "REGULAR":
        return styles.statusRegular;
      case "HABILITADA":
        return styles.statusHabilitada;
      case "BLOQUEADA":
        return styles.statusBloqueada;
      default:
        return "";
    }
  })();

  const cardClasses = [
    styles.nodeCard,
    statusClass,
    isSelected ? styles.nodeSelected : "",
    isUpstream ? styles.nodeUpstream : "",
    isDownstream ? styles.nodeDownstream : "",
    isDimmed ? styles.nodeDimmed : "",
    isSimulated ? styles.nodeSimulated : "",
  ]
    .filter(Boolean)
    .join(" ");

  const renderStatusIcon = () => {
    switch (computedStatus) {
      case "APROBADA":
        return (
          <span title="Aprobada" className={styles.iconWrap}>
            <CheckCircle2 size={12} className={styles.iconAprobada} />
          </span>
        );
      case "PROMOCIONADA":
        return (
          <span title="Promocionada" className={styles.iconWrap}>
            <Award size={12} className={styles.iconPromocionada} />
          </span>
        );
      case "CURSANDO":
        return (
          <span title="Cursando" className={styles.iconWrap}>
            <BookOpen size={12} className={styles.iconCursando} />
          </span>
        );
      case "REGULAR":
        return (
          <span title="Regularizada (Pendiente de Final)" className={styles.iconWrap}>
            <Sparkles size={12} className={styles.iconRegular} />
          </span>
        );
      case "HABILITADA":
        return (
          <span
            className={styles.dotHabilitada}
            title="Habilitada para cursar"
          />
        );
      case "BLOQUEADA":
        return (
          <span title="Bloqueada por correlativas" className={styles.iconWrap}>
            <Lock size={11} className={styles.iconBloqueada} />
          </span>
        );
    }
  };

  return (
    <div
      id={`materia-node-${materia.id}`}
      className={cardClasses}
      onClick={() => onSelect(materia.id)}
      onMouseEnter={() => onHover(materia.id)}
      onMouseLeave={() => onHover(null)}
      title={`${materia.nombre} (${materia.codigo}) - Estado: ${computedStatus}${isSimulated ? " (Simulada)" : ""}`}
    >
      <div className={styles.nodeHeader}>
        <div className={styles.codigoGroup}>
          {renderStatusIcon()}
          <span className={styles.codigo}>{materia.codigo}</span>
        </div>
        <div className={styles.badgesGroup}>
          {isSimulated && (
            <span className={styles.simBadge} title="Simulada como aprobada">
              SIM
            </span>
          )}
          {materia.promedio > 0 &&
            (computedStatus === "APROBADA" ||
              computedStatus === "PROMOCIONADA") && (
              <span
                className={styles.notaBadge}
                title={`Calificación: ${materia.promedio}`}
              >
                {materia.promedio}
              </span>
            )}
          <span className={styles.cuatriBadge}>{materia.cuatrimestre}</span>
        </div>
      </div>

      <div className={styles.nombre}>{materia.nombre}</div>

      <div className={styles.nodeFooter}>
        {/* Simulation trigger */}
        {isSimulationActive ? (
          <button
            type="button"
            className={`${styles.simButton} ${isSimulated ? styles.simButtonActive : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSimulate(materia.id);
            }}
            title={
              isSimulated
                ? "Quitar simulación de aprobación"
                : "Simular como aprobada"
            }
          >
            <FlaskConical size={10} />
            <span>{isSimulated ? "Aprobada" : "Simular"}</span>
          </button>
        ) : (
          (nodeData.correlativasCursarFaltantes.length > 0 ||
            nodeData.correlativasCursarCumplidas.length > 0) && (
            <span className={styles.reqPill} title="Correlativas requeridas">
              {nodeData.correlativasCursarCumplidas.length}/
              {nodeData.correlativasCursarCumplidas.length +
                nodeData.correlativasCursarFaltantes.length}{" "}
              req
            </span>
          )
        )}
      </div>
    </div>
  );
};
