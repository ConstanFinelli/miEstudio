import React from "react";
import styles from "./EvaluationsList.module.css";
import { FileText, Plus, Edit2, Trash2 } from "lucide-react";
import type { InstanciaEvaluacion } from "../../../../types/academic";

interface EvaluationsListProps {
  evaluations: InstanciaEvaluacion[];
  onOpenEvaluationModal: () => void;
  onEditEvaluation?: (evaluation: InstanciaEvaluacion) => void;
  onDeleteEvaluation?: (id: string, titulo: string) => void;
}

export const EvaluationsList: React.FC<EvaluationsListProps> = ({
  evaluations,
  onOpenEvaluationModal,
  onEditEvaluation,
  onDeleteEvaluation,
}) => {
  const gradedEvaluations = evaluations.filter(
    (e) => e.nota !== null && e.nota !== undefined && !isNaN(Number(e.nota))
  );

  const totalWeighted = gradedEvaluations.reduce(
    (acc, e) => acc + Number(e.nota) * (Number(e.peso) > 0 ? Number(e.peso) : 1),
    0
  );
  const totalWeight = gradedEvaluations.reduce(
    (acc, e) => acc + (Number(e.peso) > 0 ? Number(e.peso) : 1),
    0
  );
  const currentAvg = totalWeight > 0 ? totalWeighted / totalWeight : 0;

  return (
    <div className={styles.evalListSection}>
      <div className={styles.evalListHeader}>
        <div className={styles.evalHeaderLeft}>
          <div className={styles.evalHeaderTitle}>
            INSTANCIAS DE EVALUACIÓN ({evaluations.length} REGISTRADAS)
          </div>
          {gradedEvaluations.length > 0 && (
            <span className={styles.avgPill}>
              Promedio ponderado: {currentAvg.toFixed(2)} / 10
            </span>
          )}
        </div>
        <button
          className={`${styles.btnPrimary} ${styles.btnAddSmall}`}
          onClick={onOpenEvaluationModal}
        >
          <Plus size={12} />
          <span>Agregar Instancia de Evaluación</span>
        </button>
      </div>

      {evaluations.length === 0 ? (
        <div className={styles.emptyState}>
          No hay instancias de evaluación registradas para esta materia.
        </div>
      ) : (
        evaluations.map((evalItem) => (
        <div key={evalItem.id} className={styles.evalItemRow}>
          <div className={styles.evalItemLeft}>
            <div className={styles.evalIconSquare}>
              <FileText size={15} />
            </div>
            <div className={styles.evalInfo}>
              <div className={styles.evalMetaPills}>
                <span className={styles.tipoBadge}>
                  {evalItem.tipo}
                </span>
                <span>
                  Fecha:{" "}
                  {new Date(evalItem.fecha).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>Peso: {evalItem.peso}%</span>
              </div>
              <div className={styles.evalItemTitle}>{evalItem.titulo}</div>
              {Array.isArray(evalItem.temario) &&
                evalItem.temario.length > 0 && (
                  <div className={styles.evalItemSub}>
                    {evalItem.temario.join(", ")}
                  </div>
                )}
            </div>
          </div>

          <div className={styles.evalItemRight}>
            {evalItem.nota !== null ? (
              <div className={styles.scorePill}>
                <span>{evalItem.nota.toFixed(1)}</span>
                <span className={styles.scoreMax}>/ 10</span>
              </div>
            ) : (
              <span className={styles.noScoreBadge}>
                Sin nota
              </span>
            )}

            {onEditEvaluation && (
              <button
                className={styles.iconBtnSmall}
                title="Editar evaluación"
                onClick={() => onEditEvaluation(evalItem)}
              >
                <Edit2 size={12} />
              </button>
            )}
            {onDeleteEvaluation && (
              <button
                className={styles.iconBtnSmall}
                title="Eliminar evaluación"
                onClick={() => onDeleteEvaluation(evalItem.id, evalItem.titulo)}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      )))}
    </div>
  );
};

export default EvaluationsList;
