import React from "react";
import styles from "./MateriasList.module.css";
import { Trash2 } from "lucide-react";
import type { Materia } from "../../../../types/academic";
import { StatusBadge } from "../../../components";

interface MateriasListProps {
  materias: Materia[];
  selectedMateriaId: string;
  onSelectMateria: (id: string) => void;
  onOpenMateriaModal?: () => void;
  onDeleteMateria?: (id: string, nombre: string) => void;
}

export const MateriasList: React.FC<MateriasListProps> = ({
  materias,
  selectedMateriaId,
  onSelectMateria,
  onOpenMateriaModal,
  onDeleteMateria,
}) => {
  return (
    <div className={styles.masterColumn}>
      <div className={styles.masterHeader}>
        <span>Materias Registradas ({materias.length})</span>
        <span className={styles.masterSub}>Clic para inspeccionar</span>
      </div>

      {materias.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyTitle}>
            No hay materias en este filtro
          </p>
          <span className={styles.emptyDesc}>
            Usa el botón "+ Nueva Materia" para registrar tu primera cursada.
          </span>
          {onOpenMateriaModal && (
            <button
              className={`${styles.btnPrimary} ${styles.btnEmptyAdd}`}
              onClick={onOpenMateriaModal}
            >
              + Nueva Materia
            </button>
          )}
        </div>
      ) : (
        materias.map((materia) => {
          const isSelected = materia.id === selectedMateriaId;
          const isCursando = materia.estado === "CURSANDO";
          return (
            <div
              key={materia.id}
              className={`${styles.subjectCard} ${isSelected ? styles.subjectCardSelected : ""}`}
              onClick={() => onSelectMateria(materia.id)}
            >
              <div className={styles.cardTopRow}>
                <span className={styles.cardCodeMeta}>
                  {materia.codigo} · {materia.anio}° Año, {materia.cuatrimestre}
                </span>
                <div className={styles.cardHeaderActions}>
                  <StatusBadge status={materia.estado} />
                  {onDeleteMateria && (
                    <button
                      className={styles.cardDeleteBtn}
                      title={`Eliminar ${materia.nombre}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMateria(materia.id, materia.nombre);
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.cardSubjectTitle}>{materia.nombre}</div>

              {isCursando ? (
                <>
                  <div className={styles.cardMetricsRow}>
                    <div className={styles.cardMetricBlock}>
                      <span className={styles.cardMetricLabel}>Promedio</span>
                      <span className={`${styles.cardMetricVal} ${styles.metricEmerald}`}>
                        {materia.promedio.toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.cardMetricBlock}>
                      <span className={styles.cardMetricLabel}>Cursada</span>
                      <span className={styles.cardMetricVal}>
                        {materia.anio}° Año · {materia.cuatrimestre}
                      </span>
                    </div>
                    <div className={styles.cardMetricBlock}>
                      <span className={styles.cardMetricLabel}>Régimen</span>
                      <span
                        className={`${styles.cardMetricVal} ${styles.regimenPill} ${
                          materia.reglasAcreditacion?.promocion?.permitePromocion === false
                            ? styles.regimenWarning
                            : styles.regimenSuccess
                        }`}
                      >
                        {materia.reglasAcreditacion?.promocion
                          ?.permitePromocion === false
                          ? "Final Oblig."
                          : "Promocionable"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.projectionRow}>
                    <span>Proyección:</span>
                    <span className={styles.projectionHighlight}>
                      {materia.reglasAcreditacion?.promocion
                        ?.permitePromocion === false
                        ? "Examen Final Obligatorio"
                        : materia.promedio >=
                            (materia.reglasAcreditacion?.promocion
                              ?.minPromedio ?? 7.0)
                          ? "☍ En camino a Promoción"
                          : "Regular (Final Pendiente)"}
                    </span>
                  </div>
                </>
              ) : (
                <div className={styles.accreditedCard}>
                  <span className={styles.accreditedCardLabel}>
                    {materia.estado === "PROMOCIONADA"
                      ? "Calificación Final Acreditada"
                      : materia.estado === "APROBADA"
                        ? "Examen Final Acreditado"
                        : "Asignatura Regularizada"}
                  </span>
                  <span className={styles.accreditedCardScore}>
                    {materia.promedio && materia.promedio > 0
                      ? `${materia.promedio.toFixed(1)} / 10`
                      : "Acreditada"}
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default MateriasList;
