import React from 'react';
import styles from './MateriasList.module.css';
import { Trash2 } from 'lucide-react';
import type { Materia } from '../../../../types/academic';
import { StatusBadge } from '../../../components';

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
  onDeleteMateria
}) => {
  return (
    <div className={styles.masterColumn}>
      <div className={styles.masterHeader}>
        <span>Materias Registradas ({materias.length})</span>
        <span style={{ color: 'var(--text-dim)' }}>Clic para inspeccionar</span>
      </div>

      {materias.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-secondary)' }}>
            No hay materias en este filtro
          </p>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '12px' }}>
            Usa el botón "+ Nueva Materia" para registrar tu primera cursada.
          </span>
          {onOpenMateriaModal && (
            <button
              className={styles.btnPrimary}
              style={{ padding: '6px 14px', fontSize: '11px', margin: '0 auto' }}
              onClick={onOpenMateriaModal}
            >
              + Nueva Materia
            </button>
          )}
        </div>
      ) : (
        materias.map((materia) => {
          const isSelected = materia.id === selectedMateriaId;
          const isCursando = materia.estado === 'CURSANDO';
          return (
            <div
              key={materia.id}
              className={`${styles.subjectCard} ${isSelected ? styles.subjectCardSelected : ''}`}
              onClick={() => onSelectMateria(materia.id)}
            >
              <div className={styles.cardTopRow}>
                <span className={styles.cardCodeMeta}>
                  {materia.codigo} · {materia.anio}° Año, {materia.cuatrimestre}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                      <span className={styles.cardMetricVal} style={{ color: 'var(--emerald)' }}>
                        {materia.promedio.toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.cardMetricBlock}>
                      <span className={styles.cardMetricLabel}>Cursada</span>
                      <span className={styles.cardMetricVal}>{materia.anio}° Año · {materia.cuatrimestre}</span>
                    </div>
                    <div className={styles.cardMetricBlock}>
                      <span className={styles.cardMetricLabel}>Régimen</span>
                      <span className={styles.cardMetricVal} style={{ fontSize: '11px', color: materia.reglasAcreditacion?.promocion?.permitePromocion === false ? 'var(--amber)' : 'var(--emerald)' }}>
                        {materia.reglasAcreditacion?.promocion?.permitePromocion === false ? 'Final Oblig.' : 'Promocionable'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.projectionRow}>
                    <span>Proyección:</span>
                    <span className={styles.projectionHighlight}>
                      {materia.reglasAcreditacion?.promocion?.permitePromocion === false
                        ? 'Examen Final Obligatorio'
                        : (materia.promedio >= (materia.reglasAcreditacion?.promocion?.minPromedio ?? 7.0)
                            ? '☍ En camino a Promoción'
                            : 'Regular (Final Pendiente)')}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ padding: '8px', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {materia.estado === 'PROMOCIONADA' ? 'Calificación Final Acreditada' : 'Acta Examen Final #1042'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--emerald)' }}>
                    {materia.calificacionFinal?.toFixed(1)} / 10
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
