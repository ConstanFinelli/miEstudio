import React from "react";
import styles from "./MateriaDetailHeader.module.css";
import { Edit2, Trash2 } from "lucide-react";
import type { Materia } from "../../../../types/academic";

interface MateriaDetailHeaderProps {
  materia: Materia;
  onEditMateria?: () => void;
  onDeleteMateria?: (id: string, nombre: string) => void;
}

export const MateriaDetailHeader: React.FC<MateriaDetailHeaderProps> = ({
  materia,
  onEditMateria,
  onDeleteMateria,
}) => {
  const titular = materia?.profesores?.titular?.trim();
  const jtp = materia?.profesores?.jtp?.trim();

  return (
    <div className={styles.detailHeader}>
      <div className={styles.detailHeaderLeft}>
        <div className={styles.detailMetaLine}>
          <span>{materia.codigo}</span>
          <span>·</span>
          <span>{materia.comision}</span>
        </div>
        <h2 className={styles.detailTitle}>{materia.nombre}</h2>
        <p className={styles.detailStaff}>
          {titular && <span>Titular: <strong style={{ color: "var(--text-secondary)" }}>{titular}</strong></span>}
          {titular && jtp && <span> · </span>}
          {jtp && <span>JTP: <strong style={{ color: "var(--text-secondary)" }}>{jtp}</strong></span>}
          {!titular && !jtp && (
            <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>
              Docentes sin asignar
            </span>
          )}
        </p>
      </div>

      <div className={styles.detailHeaderActions}>
        {onEditMateria && (
          <button
            type="button"
            className={styles.iconBtnSmall}
            onClick={onEditMateria}
            title="Editar Materia"
          >
            <Edit2 size={13} />
          </button>
        )}
        {onDeleteMateria && (
          <button
            className={styles.deleteBtn}
            onClick={() => onDeleteMateria(materia.id, materia.nombre)}
            title={`Eliminar ${materia.nombre}`}
          >
            <Trash2 size={13} />
            <span>Eliminar</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MateriaDetailHeader;
