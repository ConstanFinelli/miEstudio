import React from 'react';
import styles from '../MateriasView.module.css';
import { FileText, Plus, Edit2, Trash2 } from 'lucide-react';
import type { InstanciaEvaluacion } from '../../../types/academic';

interface EvaluationsListProps {
  evaluations: InstanciaEvaluacion[];
  onOpenEvaluationModal: () => void;
  onDeleteEvaluation?: (id: string, titulo: string) => void;
}

export const EvaluationsList: React.FC<EvaluationsListProps> = ({
  evaluations,
  onOpenEvaluationModal,
  onDeleteEvaluation
}) => {
  return (
    <div className={styles.evalListSection}>
      <div className={styles.evalListHeader}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          INSTANCIAS DE EVALUACIÓN ({evaluations.length} REGISTRADAS)
        </div>
        <button className={styles.btnPrimary} onClick={onOpenEvaluationModal} style={{ padding: '4px 10px', fontSize: '11px' }}>
          <Plus size={12} />
          <span>+ Agregar Instancia de Evaluación</span>
        </button>
      </div>

      {evaluations.map((evalItem) => (
        <div key={evalItem.id} className={styles.evalItemRow}>
          <div className={styles.evalItemLeft}>
            <div className={styles.evalIconSquare}>
              <FileText size={15} />
            </div>
            <div className={styles.evalInfo}>
              <div className={styles.evalMetaPills}>
                <span style={{ background: 'var(--surface-3)', padding: '1px 5px', borderRadius: '2px', color: 'var(--text-secondary)' }}>
                  {evalItem.tipo}
                </span>
                <span>Fecha: {new Date(evalItem.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <span>Peso: {evalItem.peso}%</span>
              </div>
              <div className={styles.evalItemTitle}>{evalItem.titulo}</div>
              {Array.isArray(evalItem.temario) && evalItem.temario.length > 0 && (
                <div className={styles.evalItemSub}>{evalItem.temario.join(', ')}</div>
              )}
            </div>
          </div>

          <div className={styles.evalItemRight}>
            {evalItem.nota !== null ? (
              <div className={styles.scorePill}>
                <span>{evalItem.nota.toFixed(1)}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>/ 10</span>
              </div>
            ) : (
              <button className={styles.btnActionLight} onClick={() => alert('Cargar calificación')}>
                Ingresar Nota
              </button>
            )}
            <button className={styles.iconBtnSmall} title="Editar">
              <Edit2 size={12} />
            </button>
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
      ))}
    </div>
  );
};

export default EvaluationsList;
