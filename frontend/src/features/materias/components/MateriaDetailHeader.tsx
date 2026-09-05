import React from 'react';
import styles from '../MateriasView.module.css';
import { Edit2, Download, RotateCcw } from 'lucide-react';
import type { Materia } from '../../../types/academic';

interface MateriaDetailHeaderProps {
  materia: Materia;
}

export const MateriaDetailHeader: React.FC<MateriaDetailHeaderProps> = ({ materia }) => {
  return (
    <div className={styles.detailHeader}>
      <div className={styles.detailHeaderLeft}>
        <div className={styles.detailMetaLine}>
          <span>{materia.codigo}</span>
          <span>{materia.comision}</span>
        </div>
        <h2 className={styles.detailTitle}>{materia.nombre}</h2>
        <p className={styles.detailStaff}>
          Titular: {materia.profesores.titular} · JTP: {materia.profesores.jtp}
        </p>
      </div>

      <div className={styles.detailHeaderActions}>
        <button className={styles.iconBtnSmall} title="Editar Materia">
          <Edit2 size={13} />
        </button>
        <button className={styles.iconBtnSmall} title="Descargar Historial">
          <Download size={13} />
        </button>
        <button className={styles.iconBtnSmall} title="Historial de Cambios">
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
};

export default MateriaDetailHeader;
